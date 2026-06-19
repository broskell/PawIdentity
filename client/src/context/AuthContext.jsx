import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { syncUserWithBackend } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, role = 'owner') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const synced = await syncUserWithBackend(userCredential.user, role);
    setDbUser(synced.user);
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const synced = await syncUserWithBackend(userCredential.user);
    setDbUser(synced.user);
    return userCredential;
  };

  const loginWithGoogle = async (role = 'owner') => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const synced = await syncUserWithBackend(userCredential.user, role);
    setDbUser(synced.user);
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const synced = await syncUserWithBackend(user);
          setDbUser(synced.user);
        } catch (err) {
          console.error('Error syncing user with database:', err);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    dbUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
