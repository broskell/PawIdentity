import { ScanLog, Pet, QRTag, Notification, User } from '../models/index.js';
import { sendSMS } from '../services/twilio.js';

export const logScan = async (req, res) => {
  try {
    const { slug } = req.params;
    const { latitude, longitude, city, country, device, browser } = req.body;

    const pet = await Pet.findOne({ slug });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet profile not found' });
    }

    const scanLog = await ScanLog.create({
      pet: pet._id,
      latitude,
      longitude,
      city: city || 'Unknown City',
      country: country || 'Unknown Country',
      device: device || 'Mobile Device',
      browser: browser || 'Unknown Browser',
      scannedAt: new Date()
    });

    const qrTag = await QRTag.findOne({ pet: pet._id });
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
        message: `Your pet ${pet.name}'s smart tag was scanned using a ${device || 'browser'}.`,
        type: 'scan',
        link: `/dashboard`,
        metadata: {
          city: city || 'Unknown City',
          country: country || 'Unknown Country',
          device
        }
      });

      if (owner.phone) {
        let smsMessage = `PAWIDENTITY Alert: ${pet.name}'s QR Tag was scanned.`;
        if (city) {
          smsMessage += ` Location: ${city}, ${country || ''}.`;
        }
        smsMessage += ` View details on your dashboard.`;
        await sendSMS(owner.phone, smsMessage);
      }
    }

    const safePet = {
      _id: pet._id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      dob: pet.dob,
      photo: pet.photo,
      status: pet.status,
      slug: pet.slug,
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
