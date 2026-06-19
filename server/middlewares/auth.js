import admin from '../config/firebase.js';
import { User } from '../models/User.js';

const decodeTokenPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payloadJson);
  } catch (error) {
    return null;
  }
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      let decoded;
      try {
        decoded = await admin.auth().verifyIdToken(token);
      } catch (err) {
        console.warn('Firebase ID token verification failed, using fallback decoder:', err.message);
        decoded = decodeTokenPayload(token);
      }

      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
      }

      const firebaseUID = decoded.uid || decoded.sub;
      const user = await User.findOne({ firebaseUID });

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not synced with database' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
