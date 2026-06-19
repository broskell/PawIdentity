import { Pet, QRTag, User } from '../models/index.js';
import QRCode from 'qrcode';
import { uploadToCloudinary } from '../services/cloudinary.js';

export const createPet = async (req, res) => {
  try {
    const { name, species, breed, gender, dob, weight, color, microchipId, photo, emergencyContacts } = req.body;
    const owner = req.user._id;

    // Generate slug
    const rand = Math.random().toString(36).substring(2, 6);
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rand}`;

    let photoUrl = '';
    if (photo) {
      if (photo.startsWith('data:image')) {
        photoUrl = await uploadToCloudinary(photo);
      } else {
        photoUrl = photo;
      }
    }

    // Create Pet
    const pet = await Pet.create({
      owner,
      name,
      species,
      breed,
      gender,
      dob,
      weight,
      color,
      microchipId,
      photo: photoUrl,
      status: 'active',
      isVaccinated: false,
      emergencyContacts: emergencyContacts || []
    });

    // Generate Tag ID
    const count = await Pet.countDocuments({});
    const tagId = `PID-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Create QR pointing to public page
    const clientUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/pet/${slug}`;
    const qrDataUrl = await QRCode.toDataURL(clientUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 512
    });

    const qrImageUrl = await uploadToCloudinary(qrDataUrl);

    // Create QRTag
    const qrTag = await QRTag.create({
      pet: pet._id,
      tagId,
      slug,
      qrImage: qrImageUrl,
      status: 'active'
    });

    // Link tag back to pet
    pet.qrTag = qrTag._id;
    await pet.save();

    res.status(201).json({
      success: true,
      message: 'Pet registered successfully with QR tag',
      pet,
      qrTag
    });
  } catch (error) {
    console.error('Error in createPet:', error);
    res.status(500).json({ success: false, message: 'Server error during pet registration' });
  }
};

export const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).populate('qrTag');
    
    const petsWithTags = pets.map((pet) => ({
      pet,
      qrTag: pet.qrTag
    }));

    res.status(200).json({
      success: true,
      pets: petsWithTags
    });
  } catch (error) {
    console.error('Error in getMyPets:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pets' });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id }).populate('qrTag');
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.status(200).json({ success: true, pet, qrTag: pet.qrTag });
  } catch (error) {
    console.error('Error in getPetById:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pet details' });
  }
};

export const updatePet = async (req, res) => {
  try {
    const { name, species, breed, gender, dob, weight, color, microchipId, photo, status, isVaccinated, emergencyContacts } = req.body;
    let pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id });

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    let photoUrl = pet.photo;
    if (photo && photo.startsWith('data:image')) {
      photoUrl = await uploadToCloudinary(photo);
    }

    pet.name = name || pet.name;
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.gender = gender || pet.gender;
    if (dob) pet.dob = dob;
    if (weight) pet.weight = weight;
    if (color) pet.color = color;
    if (microchipId) pet.microchipId = microchipId;
    pet.photo = photoUrl;
    pet.status = status || pet.status;
    if (isVaccinated !== undefined) pet.isVaccinated = isVaccinated;
    if (emergencyContacts) pet.emergencyContacts = emergencyContacts;

    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Pet updated successfully',
      pet
    });
  } catch (error) {
    console.error('Error in updatePet:', error);
    res.status(500).json({ success: false, message: 'Server error updating pet' });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    await QRTag.findOneAndDelete({ pet: pet._id });
    res.status(200).json({ success: true, message: 'Pet and its QR tag deleted' });
  } catch (error) {
    console.error('Error in deletePet:', error);
    res.status(500).json({ success: false, message: 'Server error deleting pet' });
  }
};
