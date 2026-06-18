import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Pet, ScanLog, User, Notification } from '@/lib/models';
import { sendSMS } from '@/lib/twilio';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { slug, lat, lng, city, country, ip, device, browser } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing pet slug' }, { status: 400 });
    }

    // 1. Locate the pet and populate owner profile
    const pet = await Pet.findOne({ slug }).populate('owner');
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // 2. Identify the scanner type
    let scanType: 'public' | 'owner' | 'admin' = 'public';
    // If the scanner passes their Firebase Bearer token, we can check if they are the owner
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Mock validation to see if the user is owner/admin
      try {
        const token = authHeader.split('Bearer ')[1];
        // We can match user.id to pet.owner._id
        const owner = pet.owner as any;
        if (owner && token === owner.firebaseUID) {
          scanType = 'owner';
        }
      } catch (err) {
        // Fallback to public
      }
    }

    // 3. Create ScanLog ledger
    const scanLog = await ScanLog.create({
      pet: pet._id,
      city: city || 'Unknown',
      country: country || 'Unknown',
      lat: lat || 0,
      lng: lng || 0,
      ip: ip || req.headers.get('x-forwarded-for') || '127.0.0.1',
      device: device || 'Mobile device',
      browser: browser || 'QR Scanner',
      time: new Date(),
      scanType
    });

    const owner = pet.owner as any;

    if (owner) {
      // 4. Save a Notification entry in-app
      const scanTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const locationStr = city ? `${city}, ${country || ''}` : 'Unknown location';
      
      await Notification.create({
        user: owner._id,
        title: `${pet.name} Scanned`,
        message: `${pet.name} was scanned at ${locationStr} (${scanTime}).`,
        type: 'scan',
        read: false
      });

      // 5. Trigger Twilio SMS if owner phone is registered
      if (owner.phone) {
        const smsMessage = `${pet.name} was scanned. Location: ${locationStr}. Time: ${scanTime}. Open PawPass to view details.`;
        await sendSMS(owner.phone, smsMessage);
      }

      // 6. Send email notification
      if (owner.email) {
        const emailSubject = `Alert: ${pet.name} QR Tag Scanned!`;
        const emailBody = `Hello ${owner.name},\n\nYour pet ${pet.name}'s QR Tag was scanned.\n\nDetails:\n- Location: ${locationStr}\n- Coordinates: Lat ${lat || 'N/A'}, Lng ${lng || 'N/A'}\n- Time: ${scanTime}\n- Browser/Device: ${browser || 'N/A'} / ${device || 'N/A'}\n\nYou can track scan history on your PawPass Owner Dashboard.\n\nBest regards,\nThe PawPass Team`;
        await sendEmail(owner.email, emailSubject, emailBody);
      }

      // 7. Simulated Firebase Push Notification (FCM)
      console.log(`[FCM PUSH ALERT] Dispatched to owner UID ${owner.firebaseUID}: "${pet.name} scanned at ${locationStr}!"`);
    }

    return NextResponse.json({
      message: 'Scan logged and owner notified successfully',
      scanLog
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/scans error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
