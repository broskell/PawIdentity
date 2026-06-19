import { ScanLog, Pet, QRTag, Notification, User } from '../models/index.js';
import { sendSMS } from '../services/twilio.js';

export const logScan = async (req, res) => {
  try {
    const { slug } = req.params;
    const { latitude, longitude, city, browser, device, ipAddress } = req.body;

    const pet = await Pet.findOne({ slug }).populate('qrTag');
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet profile not found' });
    }

    const qrTag = pet.qrTag;

    // Log the scan
    const scanLog = await ScanLog.create({
      pet: pet._id,
      qrTag: qrTag ? qrTag._id : null,
      latitude,
      longitude,
      city: city || 'Unknown City',
      browser: browser || 'Unknown Browser',
      device: device || 'Mobile Device',
      ipAddress: ipAddress || req.ip || '127.0.0.1',
      ownerNotified: false,
      scannedAt: new Date()
    });

    if (qrTag) {
      qrTag.scanCount += 1;
      qrTag.lastScannedAt = new Date();
      await qrTag.save();
    }

    const owner = await User.findById(pet.owner);
    if (owner) {
      await Notification.create({
        user: owner._id,
        title: `QR Smart Tag Scanned`,
        message: `Your pet ${pet.name}'s smart tag was scanned.`,
        type: 'scan',
        status: 'unread',
        link: `/dashboard`,
        metadata: {
          city: city || 'Unknown City',
          device
        }
      });

      if (owner.phone) {
        let smsMessage = `PAWIDENTITY Alert: ${pet.name}'s QR Tag was scanned.`;
        if (city) {
          smsMessage += ` Location: ${city}.`;
        }
        smsMessage += ` View details on your dashboard.`;
        await sendSMS(owner.phone, smsMessage);
        
        // Mark owner as notified
        scanLog.ownerNotified = true;
        await scanLog.save();
      }
    }

    const safePet = {
      _id: pet._id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      dob: pet.dob,
      weight: pet.weight,
      color: pet.color,
      microchipId: pet.microchipId,
      photo: pet.photo,
      status: pet.status,
      isVaccinated: pet.isVaccinated,
      emergencyContacts: pet.emergencyContacts
    };

    res.status(200).json({
      success: true,
      message: 'Scan recorded successfully',
      pet: safePet
    });
  } catch (error) {
    console.error('Error logging scan:', error);
    res.status(500).json({ success: false, message: 'Server error logging scan' });
  }
};
