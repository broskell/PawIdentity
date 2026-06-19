import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Pet, QRTag, LostPet, MedicalRecord, Vaccination, Notification } from '../models/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB to seed dummy data...');

    await User.deleteMany({});
    await Pet.deleteMany({});
    await QRTag.deleteMany({});
    await LostPet.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Vaccination.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing database records.');

    // 1. Create Users
    const owner = await User.create({
      firebaseUID: 'google-oauth2|109283748293',
      name: 'Kellampalli Saathvik',
      email: 'saathvik@gmail.com',
      phone: '+18598881260',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      role: 'owner',
      verified: true
    });

    const vet = await User.create({
      firebaseUID: 'firebase-vet-mock-uid',
      name: 'Dr. Clara Sterling',
      email: 'clara.vet@pawidentity.com',
      phone: '+15559876543',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      role: 'vet',
      verified: true
    });

    const shelter = await User.create({
      firebaseUID: 'firebase-shelter-mock-uid',
      name: 'Downtown Animal Shelter',
      email: 'shelter@pawidentity.com',
      phone: '+15555551234',
      photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150',
      role: 'shelter',
      verified: true
    });

    console.log('Dummy Users created successfully.');

    // 2. Create Pet (Bruno)
    const pet = await Pet.create({
      owner: owner._id,
      name: 'Bruno',
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'male',
      dob: new Date('2022-04-12'),
      photo: '',
      status: 'missing',
      slug: 'bruno',
      isVaccinated: true,
      emergencyContacts: [
        { name: 'Srinivas', relation: 'Guardian', phone: '+18598881260' }
      ]
    });

    console.log('Dummy Pet Bruno created.');

    // 3. Create QRTag
    const qrTag = await QRTag.create({
      pet: pet._id,
      tagId: 'PID-2026-001',
      slug: 'bruno',
      qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:5173/pet/bruno',
      status: 'active',
      scanCount: 3,
      lastScannedAt: new Date()
    });

    console.log('Dummy QRTag created.');

    // 4. Create LostPet record
    await LostPet.create({
      pet: pet._id,
      missingSince: new Date('2026-06-18'),
      lastSeen: 'Central Park Sighting',
      city: 'Hyderabad',
      reward: 5000,
      description: 'Very friendly Golden Retriever. Answers to Bruno. Has a black collar with the PawIdentity smart QR tag.',
      status: 'missing'
    });

    console.log('Dummy LostPet record created.');

    // 5. Create Medical Record
    await MedicalRecord.create({
      pet: pet._id,
      title: 'De-worming Treatment',
      type: 'prescription',
      description: 'Prescribed 1 tablet of Milbemax de-wormer.',
      attachments: [],
      addedBy: vet._id
    });

    console.log('Dummy Medical Record created.');

    // 6. Create Vaccination
    await Vaccination.create({
      pet: pet._id,
      vaccineName: 'Rabies Booster',
      dateGiven: new Date('2026-01-10'),
      nextDue: new Date('2027-01-10'),
      batchNumber: 'RAB-7789A',
      verified: true
    });

    console.log('Dummy Vaccination record created.');

    // 7. Create Notification
    await Notification.create({
      user: owner._id,
      title: 'QR Smart Tag Scanned',
      message: "Bruno's tag was scanned using a mobile browser.",
      type: 'scan',
      link: '/dashboard',
      metadata: {
        city: 'Hyderabad',
        country: 'India',
        device: 'Mobile'
      }
    });

    console.log('Dummy Notification created.');

    console.log('Database seeded successfully with premium dummy data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
