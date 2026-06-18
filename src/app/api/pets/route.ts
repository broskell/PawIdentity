import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Pet, MedicalRecord, User, QRTag } from '@/lib/models';
import { verifyAuth } from '@/lib/authMiddleware';
import QRCode from 'qrcode';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sendSMS } from '@/lib/twilio';

// GET /api/pets - Get list of pets (dependent on user role)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    // If query has specific slug, return single pet profile
    if (slug) {
      const pet = await Pet.findOne({ slug }).populate('owner', 'name email phone');
      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
      }

      // Safe, privacy-preserving copy for public scanners
      const publicPet = {
        _id: pet._id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        dob: pet.dob,
        gender: pet.gender,
        weight: pet.weight,
        bloodGroup: pet.bloodGroup,
        temperament: pet.temperament,
        photo: pet.photo,
        gallery: pet.gallery,
        slug: pet.slug,
        vaccinated: pet.vaccinated,
        lost: pet.lost,
        microchipId: pet.microchipId,
        emergencyContacts: pet.emergencyContacts,
        owner: {
          name: (pet.owner as any).name,
          phone: pet.lost ? (pet.owner as any).phone : undefined,
          email: pet.lost ? (pet.owner as any).email : undefined
        }
      };

      return NextResponse.json({ pet: publicPet }, { status: 200 });
    }

    let query: any = {};

    // Filter by ownership if role is owner or shelter
    if (auth.user.role === 'owner') {
      query.owner = auth.user._id;
    } else if (auth.user.role === 'shelter') {
      query.owner = auth.user._id;
    }

    // Support search for vets and admins
    if (search && (auth.user.role === 'vet' || auth.user.role === 'admin')) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { microchipId: { $regex: search, $options: 'i' } }
      ];
    }

    const pets = await Pet.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 });
    return NextResponse.json({ pets }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/pets error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/pets - Register a new pet and auto-generate QR tag
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    if (!['owner', 'shelter', 'admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Forbidden. Vets cannot register pets.' }, { status: 403 });
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
      emergencyContacts
    } = body;

    if (!name || !species || !breed) {
      return NextResponse.json({ error: 'Missing required fields: name, species, breed' }, { status: 400 });
    }

    // 1. Generate clean URL-safe slug
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const slug = `${cleanName}-${rand}`;

    // 2. Generate QR Code image as Base64 data URI
    const domain = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    const qrLinkUrl = `${domain}/pet/${slug}`;
    const qrBase64 = await QRCode.toDataURL(qrLinkUrl, {
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // 3. Upload QR tag image and profile photo to Cloudinary
    let qrCloudUrl = '';
    try {
      const qrUpload = await uploadToCloudinary(qrBase64, 'pawpass_qr_tags');
      qrCloudUrl = qrUpload.secure_url;
    } catch (err) {
      console.error('Cloudinary QR upload failed, falling back to local base64:', err);
      qrCloudUrl = qrBase64;
    }

    let petPhotoUrl = photo || '';
    if (photo && photo.startsWith('data:')) {
      try {
        const photoUpload = await uploadToCloudinary(photo, 'pawpass_pets');
        petPhotoUrl = photoUpload.secure_url;
      } catch (err) {
        console.error('Cloudinary photo upload failed:', err);
      }
    }

    // 4. Create the Pet document
    const pet = await Pet.create({
      owner: auth.user._id,
      name,
      species,
      breed,
      dob: dob ? new Date(dob) : undefined,
      gender: gender || 'unknown',
      weight,
      bloodGroup,
      temperament,
      photo: petPhotoUrl,
      gallery: gallery || [],
      slug,
      qrUrl: qrCloudUrl,
      microchipId,
      emergencyContacts: emergencyContacts || []
    });

    // 5. Create default medical records
    await MedicalRecord.create({
      pet: pet._id,
      vaccines: [],
      allergies: [],
      prescriptions: [],
      surgeries: [],
      diseases: [],
      documents: [],
      notes: 'Initial profile created.'
    });

    // 6. Save in QR Tags ledger
    await QRTag.create({
      pet: pet._id,
      slug,
      qrImage: qrCloudUrl,
      status: 'active'
    });

    // 7. Dispatch welcome SMS / alert
    if (auth.user.phone) {
      await sendSMS(
        auth.user.phone,
        `Welcome to PawPass! ${name}'s digital profile and QR Smart Tag have been successfully created. View it at: ${qrLinkUrl}`
      );
    }

    return NextResponse.json({
      message: 'Pet registered successfully',
      pet
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/pets error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
