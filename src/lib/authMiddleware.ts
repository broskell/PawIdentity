import { NextRequest } from 'next/server';
import { verifyFirebaseIdToken } from './firebaseAdmin';
import { connectToDatabase } from './db';
import { User, IUser } from './models';

export interface AuthContext {
  user: IUser | null;
  error?: string;
  status: number;
}

/**
 * Validates request Bearer token using Firebase Admin verification,
 * then maps to the MongoDB database profile.
 */
export async function verifyAuth(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header is missing or invalid', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return { user: null, error: 'Token is missing', status: 401 };
  }

  try {
    const decodedToken = await verifyFirebaseIdToken(token);
    await connectToDatabase();
    
    // Look up the user by firebaseUID
    let dbUser = await User.findOne({ firebaseUID: decodedToken.uid });
    
    // Auto-sync User profile from Firebase if they exist in Auth but not in our Mongo
    if (!dbUser && decodedToken.email) {
      dbUser = await User.create({
        firebaseUID: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || 'PawPass User',
        role: 'owner', // Default role
      });
    }

    return { user: dbUser, status: 200 };
  } catch (error: any) {
    console.error('verifyAuth failed:', error);
    return { user: null, error: error.message || 'Unauthorized', status: 403 };
  }
}
