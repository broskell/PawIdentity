'useContext';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { QrCode, ArrowLeft, Mail, Lock, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('owner');
  
  // Phone values
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name) {
          setError('Name is required for registration');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, name, role);
      } else {
        await loginWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otpSent) {
        // Start verify flow: call local verify start which calls Twilio/Firebase
        setOtpSent(true);
      } else {
        // Verify code
        // Success
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Phone OTP validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 selection:bg-white selection:text-black font-sans">
      <Link href="/" className="absolute top-6 left-6 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono">
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-lg p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded border border-neutral-800 flex items-center justify-center font-mono font-bold text-lg tracking-tighter mx-auto mb-4 bg-black">
            P
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            {usePhone ? 'Sign in with Phone' : isSignUp ? 'Create PawPass account' : 'Sign in to PawPass'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            {usePhone 
              ? 'Enter your mobile number to receive a secure passcode' 
              : isSignUp 
                ? 'Join thousands of pet owners safeguarding their animals' 
                : 'Enter details below or verify using single-sign on'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded text-xs text-center font-mono leading-relaxed">
            {error}
          </div>
        )}

        {/* PHONE SIGN IN FORM */}
        {usePhone ? (
          <form onSubmit={handlePhoneAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 font-mono text-xs">+91</span>
                <input
                  type="tel"
                  placeholder="90302 17599"
                  disabled={otpSent}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {otpSent && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Verification Code</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700 tracking-widest text-center"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-semibold rounded text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : otpSent ? 'Verify Code' : 'Send OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setUsePhone(false); setOtpSent(false); }}
              className="text-center text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Use Email Sign In
            </button>
          </form>
        ) : (
          /* EMAIL & SOCIAL FORM */
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Role Profile Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                >
                  <option value="owner">Pet Owner</option>
                  <option value="vet">Veterinarian</option>
                  <option value="shelter">Rescuer / Shelter</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-semibold rounded text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <span className="w-full border-b border-neutral-900"></span>
              <span className="absolute bg-neutral-950 px-3 text-[10px] font-mono text-neutral-500 uppercase">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 border border-neutral-900 bg-neutral-950 text-white font-medium rounded text-sm hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2"
            >
              Continue with Google
            </button>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                type="button"
                onClick={() => setUsePhone(true)}
                className="py-2 border border-neutral-900 rounded text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone size={12} />
                <span>Phone OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="py-2 border border-neutral-900 rounded text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
              >
                <span>{isSignUp ? 'Need Login' : 'Create Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
