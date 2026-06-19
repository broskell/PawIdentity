import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const syncUserWithBackend = async (firebaseUser, role = 'owner') => {
  const token = await firebaseUser.getIdToken();
  const response = await axios.post(
    `${API_URL}/api/auth/sync`,
    {
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      photo: firebaseUser.photoURL || '',
      phone: firebaseUser.phoneNumber || '',
      role: role
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
