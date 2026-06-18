'useContext';
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '@/lib/firebase';
import axios from 'axios';

export interface UserProfile {
  id: string;
  firebaseUID: string;
  role: 'owner' | 'vet' | 'shelter' | 'admin';
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: UserProfile | null;
  role: 'owner' | 'vet' | 'shelter' | 'admin' | 'public';
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: (details?: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Set auth tokens for axios requests
  const configureAxiosToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const syncProfile = async (details?: Partial<UserProfile>) => {
    if (!firebaseAuth.currentUser) return;
    try {
      const token = await firebaseAuth.currentUser.getIdToken(true);
      configureAxiosToken(token);
      
      const response = await axios.post('/api/auth/sync', details || {});
      setDbUser(response.data.user);
    } catch (error) {
      console.error('Error syncing profile with DB:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          configureAxiosToken(token);
          // Sync profile details
          const response = await axios.post('/api/auth/sync', {});
          setDbUser(response.data.user);
        } catch (err) {
          console.error('Initial session sync failed:', err);
        }
      } else {
        setDbUser(null);
        configureAxiosToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, pass);
    } catch (error) {
      console.error('Email login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, selectedRole: string) => {
    setLoading(true);
    try {
      const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
      await updateProfile(credentials.user, { displayName: name });
      
      // Perform initial sync specifying the role and name
      const token = await credentials.user.getIdToken();
      configureAxiosToken(token);
      const response = await axios.post('/api/auth/sync', {
        name,
        role: selectedRole,
      });
      setDbUser(response.data.user);
    } catch (error) {
      console.error('Email sign up error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(firebaseAuth);
      setDbUser(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        role: dbUser ? dbUser.role : 'public',
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
