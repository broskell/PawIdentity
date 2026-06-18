'useContext';
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

import OwnerDashboard from './owner/page';
import VetDashboard from './vet/page';
import ShelterDashboard from './shelter/page';
import AdminDashboard from './admin/page';

export default function DashboardRouter() {
  const router = useRouter();
  const { user, dbUser, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-mono text-xs">
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        Synchronizing PawPass session...
      </div>
    );
  }

  if (!user || !dbUser) {
    return null; // Redirecting
  }

  // Choose the dashboard view corresponding to their role
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'vet':
      return <VetDashboard />;
    case 'shelter':
      return <ShelterDashboard />;
    case 'owner':
    default:
      return <OwnerDashboard />;
  }
}
