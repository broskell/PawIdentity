import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Pet, LostPet } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species');
    const breed = searchParams.get('breed');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Find all pets marked as lost
    let petQuery: any = { lost: true };

    if (species) {
      petQuery.species = { $regex: new RegExp(`^${species}$`, 'i') };
    }
    if (breed) {
      petQuery.breed = { $regex: new RegExp(`^${breed}$`, 'i') };
    }
    if (search) {
      petQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const lostPetsList = await Pet.find(petQuery).populate('owner', 'name');
    const petIds = lostPetsList.map(p => p._id);

    // Fetch matching lost metadata documents (reward, location, etc.)
    let lostMetaQuery: any = { pet: { $in: petIds }, status: 'missing' };
    if (city) {
      lostMetaQuery.lastSeen = { $regex: city, $options: 'i' };
    }

    const lostMeta = await LostPet.find(lostMetaQuery).populate('pet');

    // Map together for clean frontend feed cards
    const feed = lostMeta.map(meta => {
      const petDetails = lostPetsList.find(p => p._id.toString() === (meta.pet as any)._id.toString());
      return {
        id: meta._id,
        reward: meta.reward,
        missingSince: meta.missingSince,
        lastSeen: meta.lastSeen,
        coordinates: meta.coordinates,
        status: meta.status,
        pet: petDetails || meta.pet
      };
    });

    return NextResponse.json({ feed }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/lost error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
