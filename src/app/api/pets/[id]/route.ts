import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Pet, MedicalRecord, QRTag, LostPet, ScanLog } from '@/lib/models';
import { verifyAuth } from '@/lib/authMiddleware';
import { uploadToCloudinary } from '@/lib/cloudinary';

// PUT /api/pets/[id] - Update pet profile or mark as lost
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    const { id } = await params;
    const pet = await Pet.findById(id);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Authorization check: owner, vet, or admin
    if (
      auth.user.role !== 'admin' &&
      auth.user.role !== 'vet' &&
      pet.owner.toString() !== auth.user._id.toString()
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      species,
      breed,
      dob,
      gender,
      weight,
      bloodGroup,
      temperament,
      photo,
      gallery,
      microchipId,
      vaccinated,
      lost,
      emergencyContacts,
      lostReward,
      lostLastSeen,
      lostCoordinates
    } = body;

    // Process photo update if it is a new base64 string
    let petPhotoUrl = pet.photo;
    if (photo && photo.startsWith('data:')) {
      try {
        const photoUpload = await uploadToCloudinary(photo, 'pawpass_pets');
        petPhotoUrl = photoUpload.secure_url;
      } catch (err) {
        console.error('Cloudinary update photo failed:', err);
      }
    }

    // Apply fields
    if (name) pet.name = name;
    if (species) pet.species = species;
    if (breed) pet.breed = breed;
    if (dob) pet.dob = new Date(dob);
    if (gender) pet.gender = gender;
    if (weight !== undefined) pet.weight = weight;
    if (bloodGroup !== undefined) pet.bloodGroup = bloodGroup;
    if (temperament !== undefined) pet.temperament = temperament;
    if (photo !== undefined) pet.photo = petPhotoUrl;
    if (gallery !== undefined) pet.gallery = gallery;
    if (microchipId !== undefined) pet.microchipId = microchipId;
    if (vaccinated !== undefined) pet.vaccinated = vaccinated;
    
    // Lost status toggling
    if (lost !== undefined) {
      const isLostTransition = !pet.lost && lost;
      pet.lost = lost;

      if (isLostTransition) {
        // Create a LostPet document
        await LostPet.create({
          pet: pet._id,
          reward: lostReward || 0,
          missingSince: new Date(),
          lastSeen: lostLastSeen || 'Unknown',
          coordinates: lostCoordinates || { lat: 0, lng: 0 },
          status: 'missing'
        });
      } else if (!lost) {
        // Close missing reports
        await LostPet.updateMany({ pet: pet._id, status: 'missing' }, { status: 'closed' });
      }
    }

    if (emergencyContacts) pet.emergencyContacts = emergencyContacts;

    await pet.save();

    return NextResponse.json({
      message: 'Pet updated successfully',
      pet
    }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/pets/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/pets/[id] - Remove pet and all related tracking records
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    const { id } = await params;
    const pet = await Pet.findById(id);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Only Owner and Admin can delete a pet
    if (auth.user.role !== 'admin' && pet.owner.toString() !== auth.user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cascade deletions
    await Pet.findByIdAndDelete(id);
    await MedicalRecord.deleteMany({ pet: id });
    await QRTag.deleteMany({ pet: id });
    await LostPet.deleteMany({ pet: id });
    await ScanLog.deleteMany({ pet: id });

    return NextResponse.json({ message: 'Pet and all related records deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/pets/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
