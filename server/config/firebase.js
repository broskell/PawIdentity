import admin from 'firebase-admin';

try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'pawid-f50b5'
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.warn('Firebase Admin failed to initialize:', error.message);
}

export default admin;
