import { MedicalRecord, Vaccination, Pet } from '../models/index.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// Medical Records
export const createMedicalRecord = async (req, res) => {
  try {
    const { petId, diagnosis, prescription, notes, attachments } = req.body;
    const veterinarian = req.user._id;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const attachmentUrls = [];
    if (attachments && Array.isArray(attachments)) {
      for (const file of attachments) {
        if (file.startsWith('data:')) {
          const url = await uploadToCloudinary(file);
          attachmentUrls.push(url);
        } else {
          attachmentUrls.push(file);
        }
      }
    }

    const record = await MedicalRecord.create({
      pet: petId,
      veterinarian,
      diagnosis,
      prescription,
      notes,
      attachments: attachmentUrls
    });

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      record
    });
  } catch (error) {
    console.error('Error in createMedicalRecord:', error);
    res.status(500).json({ success: false, message: 'Server error adding record' });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ pet: req.params.petId })
      .populate('veterinarian', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error in getMedicalRecords:', error);
    res.status(500).json({ success: false, message: 'Server error fetching records' });
  }
};

// Vaccinations
export const createVaccination = async (req, res) => {
  try {
    const { petId, vaccineName, dateAdministered, nextDueDate, batchNumber } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const vaccination = await Vaccination.create({
      pet: petId,
      vaccineName,
      dateAdministered,
      nextDueDate,
      batchNumber,
      verified: req.user.role === 'vet' || req.user.role === 'admin'
    });

    pet.isVaccinated = true;
    await pet.save();

    res.status(201).json({
      success: true,
      message: 'Vaccination record created',
      vaccination
    });
  } catch (error) {
    console.error('Error in createVaccination:', error);
    res.status(500).json({ success: false, message: 'Server error creating vaccination record' });
  }
};

export const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ pet: req.params.petId }).sort({ dateAdministered: -1 });
    res.status(200).json({
      success: true,
      vaccinations
    });
  } catch (error) {
    console.error('Error in getVaccinations:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vaccinations' });
  }
};

export const verifyVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    }

    vaccination.verified = true;
    await vaccination.save();

    res.status(200).json({
      success: true,
      message: 'Vaccination record verified',
      vaccination
    });
  } catch (error) {
    console.error('Error in verifyVaccination:', error);
    res.status(500).json({ success: false, message: 'Server error verifying vaccination' });
  }
};
