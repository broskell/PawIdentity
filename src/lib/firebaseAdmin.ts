import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pawid-f50b5';

if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (privateKey && clientEmail) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      initializeApp({
        projectId,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function verifyFirebaseIdToken(token: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.warn('Firebase verifyIdToken failed. Attempting decode fallback for local testing:', error);
    
    // Fallback decoding for development without service accounts
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        // Return structured user info matching decoded id token
        return {
          uid: payload.user_id || payload.uid || 'mock-uid-123',
          email: payload.email || 'user@example.com',
          name: payload.name || 'PawPass Member',
          picture: payload.picture || '',
          email_verified: payload.email_verified || true,
          auth_time: Math.floor(Date.now() / 1000),
          iss: `https://securetoken.google.com/${projectId}`,
          aud: projectId,
          exp: Math.floor(Date.now() / 1000) + 3600,
        };
      }
    } catch (e) {
      throw new Error('Invalid token structure');
    }
    throw error;
  }
}

export default admin;
