import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MedicalRecord, Pet, Vaccination } from '@/lib/models';
import { verifyAuth } from '@/lib/authMiddleware';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET /api/medical - Retrieve medical record for a pet
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json({ error: 'Missing petId parameter' }, { status: 400 });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Auth check: Admin, Vet, or Owner of the pet
    if (
      auth.user.role !== 'admin' &&
      auth.user.role !== 'vet' &&
      pet.owner.toString() !== auth.user._id.toString()
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let record = await MedicalRecord.findOne({ pet: petId });
    if (!record) {
      // Auto-create if not exists
      record = await MedicalRecord.create({
        pet: petId,
        vaccines: [],
        allergies: [],
        prescriptions: [],
        surgeries: [],
        diseases: [],
        documents: [],
        notes: ''
      });
    }

    const vaccinations = await Vaccination.find({ pet: petId }).sort({ date: -1 });

    return NextResponse.json({ record, vaccinations }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/medical error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/medical - Add entries to medical history (Vets and Admins only)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    if (auth.user.role !== 'vet' && auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only veterinarians and admins can update records.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      petId,
      vaccine,      // { name, date, nextDueDate, dose }
      prescription, // string
      allergy,      // string
      surgery,      // string
      disease,      // string
      document,     // Base64 file (PDF or Image)
      notes
    } = body;

    if (!petId) {
      return NextResponse.json({ error: 'Missing petId parameter' }, { status: 400 });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    let record = await MedicalRecord.findOne({ pet: petId });
    if (!record) {
      record = new MedicalRecord({ pet: petId });
    }

    // 1. Add Vaccine if provided
    if (vaccine && vaccine.name) {
      record.vaccines.push(vaccine.name);
      
      // Also write to formal Vaccinations ledger
      await Vaccination.create({
        pet: petId,
        vaccineName: vaccine.name,
        dose: vaccine.dose || '1 ml',
        date: vaccine.date ? new Date(vaccine.date) : new Date(),
        nextDueDate: vaccine.nextDueDate ? new Date(vaccine.nextDueDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // default 1 year
        status: 'administered'
      });
      pet.vaccinated = true;
      await pet.save();
    }

    // 2. Append clinical entries
    if (prescription) record.prescriptions.push(prescription);
    if (allergy) record.allergies.push(allergy);
    if (surgery) record.surgeries.push(surgery);
    if (disease) record.diseases.push(disease);
    if (notes) record.notes = notes;

    // 3. Upload medical file to Cloudinary if provided
    if (document && document.startsWith('data:')) {
      try {
        const upload = await uploadToCloudinary(document, 'pawpass_medical_docs');
        record.documents.push(upload.secure_url);
      } catch (err) {
        console.error('Cloudinary report upload failed:', err);
      }
    }

    await record.save();

    return NextResponse.json({
      message: 'Medical records updated successfully',
      record
    }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/medical error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
