import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { verifyAuth } from '@/lib/authMiddleware';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Authenticate the request
    const auth = await verifyAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const { name, phone, avatar, city, state, role } = body;

    // Update profile fields if provided
    if (name) auth.user.name = name;
    if (phone) auth.user.phone = phone;
    if (avatar) auth.user.avatar = avatar;
    if (city) auth.user.city = city;
    if (state) auth.user.state = state;
    if (role && ['owner', 'vet', 'shelter', 'admin'].includes(role)) {
      auth.user.role = role;
    }

    await auth.user.save();

    return NextResponse.json({
      message: 'Profile synchronized successfully',
      user: {
        id: auth.user._id,
        firebaseUID: auth.user.firebaseUID,
        role: auth.user.role,
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
        avatar: auth.user.avatar,
        city: auth.user.city,
        state: auth.user.state,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('API Auth Sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
