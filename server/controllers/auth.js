import { User } from '../models/index.js';
import admin from '../config/firebase.js';

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

export const syncUser = async (req, res) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.warn('Firebase ID token verification failed during sync, using fallback:', err.message);
      decoded = decodeTokenPayload(token);
    }

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const firebaseUID = decoded.uid || decoded.sub;
    const { name, email, profilePicture, phone, role } = req.body;

    let user = await User.findOne({ firebaseUID });

    if (user) {
      user.name = name || user.name;
      user.profilePicture = profilePicture || user.profilePicture || decoded.picture || '';
      user.phone = phone || user.phone;
      if (role) user.role = role;
      await user.save();
    } else {
      user = await User.create({
        firebaseUID,
        name: name || decoded.name || email.split('@')[0],
        email: email || decoded.email,
        phone: phone || '',
        profilePicture: profilePicture || decoded.picture || '',
        role: role || 'owner',
        verified: false
      });
    }

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      user
    });
  } catch (error) {
    console.error('Error in syncUser:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication sync' });
  }
};
