'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { 
  Users, 
  Settings, 
  Activity, 
  ShieldAlert, 
  Check, 
  Slash, 
  Trash2, 
  Loader2, 
  LogOut,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface SystemStats {
  totalPets: number;
  totalOwners: number;
  totalVets: number;
  totalShelters: number;
  totalScans: number;
  lostPets: number;
  foundPets: number;
  vaccinesDue: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'vet' | 'shelter' | 'admin';
  phone?: string;
  city?: string;
}

interface Shelter {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface Vet {
  _id: string;
  name: string;
  clinicName: string;
  licenseNumber: string;
  phone: string;
}

export default function AdminDashboard() {
  const { user, dbUser, logout } = useAuth();
  
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<Array<{ month: string; pets: number; scans: number }>>([]);
  const [lostVsFound, setLostVsFound] = useState<Array<{ name: string; count: number }>>([]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'users' | 'shelters' | 'vets'>('analytics');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system statistics
      const statsRes = await axios.get('/api/admin/analytics');
      setStats(statsRes.data.stats);
      setMonthlyGrowth(statsRes.data.monthlyGrowth || []);
      setLostVsFound(statsRes.data.lostVsFound || []);

      // 2. Fetch system users
      const usersRes = await axios.get('/api/admin/analytics?scope=users');
      setUsers(usersRes.data.users || []);
      setShelters(usersRes.data.shelters || []);
      setVets(usersRes.data.vets || []);
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspendUser = async (userId: string, currentRole: string) => {
    try {
      setActionSuccess('');
      // In our route, action 'suspend' switches role or blocks account actions
      const res = await axios.put('/api/admin/analytics', {
        userId,
        action: 'suspend'
      });
      setActionSuccess(res.data.message || 'User status updated');
      setTimeout(() => setActionSuccess(''), 3000);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Find max value for SVG charting heights
  const maxPetCount = monthlyGrowth.length > 0 ? Math.max(...monthlyGrowth.map(d => d.pets)) : 1;
  const maxScanCount = monthlyGrowth.length > 0 ? Math.max(...monthlyGrowth.map(d => d.scans)) : 1;
  const maxCount = Math.max(maxPetCount, maxScanCount);

  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-white selection:text-black font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950 flex flex-col p-6 gap-8 shrink-0">
        <div>
          <h2 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded border border-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter bg-black">
              P
            </span>
            PawPass
          </h2>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Administrator Panel</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {[
            { id: 'analytics', label: 'System Analytics', icon: <TrendingUp size={16} /> },
            { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
            { id: 'shelters', label: 'Manage Shelters', icon: <Activity size={16} /> },
            { id: 'vets', label: 'Manage Veterinarians', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left ${activeSubTab === tab.id ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-neutral-900 pt-4 flex flex-col gap-3 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{dbUser?.name}</span>
            <span className="text-[10px] font-mono text-neutral-500">Global Admin</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded text-sm transition-colors text-left"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ADMIN WORKSPACE BODY */}
      <main className="flex-1 p-10 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Compiling ledger indexes...
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* Action feedback */}
            {actionSuccess && (
              <div className="p-3 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded text-xs font-mono">
                {actionSuccess}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight capitalize">{activeSubTab} Workspace</h1>
              <p className="text-xs text-neutral-500 mt-1">Global management interface for Pet Smart Tags and Recovery Ledger.</p>
            </div>

            {/* SYSTEM ANALYTICS SECTION */}
            {activeSubTab === 'analytics' && stats && (
              <div className="flex flex-col gap-8">
                
                {/* Statistics Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Registered Pets</span>
                    <p className="text-3xl font-bold tracking-tight">{stats.totalPets}</p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Total Owners</span>
                    <p className="text-3xl font-bold tracking-tight">{stats.totalOwners}</p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Active Smart Scans</span>
                    <p className="text-3xl font-bold tracking-tight">{stats.totalScans}</p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Active Lost Cases</span>
                    <p className="text-3xl font-bold tracking-tight text-white">{stats.lostPets}</p>
                  </div>
                </div>

                {/* SVG CHARTS PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* System Growth chart (custom pure SVG) */}
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-6">
                    <div>
                      <h3 className="font-bold text-sm">System Growth (Pets vs Scans)</h3>
                      <span className="text-[10px] text-neutral-500 font-mono">Monthly aggregates (Jan - Jun)</span>
                    </div>

                    <div className="w-full h-48 relative flex items-end justify-between px-4 pt-4 border-b border-neutral-900">
                      {/* Grid lines */}
                      <div className="absolute inset-x-0 bottom-12 border-b border-neutral-900/60 pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-24 border-b border-neutral-900/60 pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-36 border-b border-neutral-900/60 pointer-events-none" />

                      {monthlyGrowth.map((data, idx) => {
                        const petHeight = `${(data.pets / maxCount) * 80}%`;
                        const scanHeight = `${(data.scans / maxCount) * 80}%`;
                        
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 w-12 z-10">
                            <div className="flex gap-1 items-end h-28 w-full justify-center">
                              {/* Pets bar */}
                              <div 
                                style={{ height: petHeight }} 
                                className="w-3 bg-white" 
                                title={`Pets: ${data.pets}`}
                              />
                              {/* Scans bar */}
                              <div 
                                style={{ height: scanHeight }} 
                                className="w-3 bg-neutral-700" 
                                title={`Scans: ${data.scans}`}
                              />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase">{data.month}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 justify-center text-[10px] font-mono text-neutral-400">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-white block" />
                        <span>Registered Pets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-neutral-700 block" />
                        <span>QR Scans Logged</span>
                      </div>
                    </div>
                  </div>

                  {/* Ratio of Lost vs Found */}
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-6">
                    <div>
                      <h3 className="font-bold text-sm">Recovery Ledger Ratios</h3>
                      <span className="text-[10px] text-neutral-500 font-mono">Lost, Recovered, and Active tags</span>
                    </div>

                    <div className="flex flex-col gap-4 justify-center flex-grow py-4">
                      {lostVsFound.map((item, idx) => {
                        const percent = stats.totalPets > 0 ? (item.count / stats.totalPets) * 100 : 0;
                        return (
                          <div key={idx} className="flex flex-col gap-1.5 text-xs">
                            <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                              <span>{item.name} ({item.count})</span>
                              <span>{percent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-850">
                              <div 
                                style={{ width: `${percent}%` }} 
                                className={`h-full ${item.name === 'Missing' ? 'bg-neutral-500' : item.name === 'Recovered' ? 'bg-white' : 'bg-neutral-200'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* USERS MANAGEMENT */}
            {activeSubTab === 'users' && (
              <div className="border border-neutral-900 bg-neutral-950 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/40 border-b border-neutral-900 text-neutral-400">
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Name</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Email</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Role</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors">
                        <td className="p-4 font-bold">{u.name}</td>
                        <td className="p-4 font-mono text-neutral-400">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 border border-neutral-800 rounded font-mono text-[9px] uppercase bg-neutral-900 text-neutral-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleToggleSuspendUser(u._id, u.role)}
                            className="px-2 py-1 border border-neutral-800 rounded text-[10px] hover:border-neutral-700 text-neutral-300 hover:text-white"
                          >
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SHELTERS MANAGEMENT */}
            {activeSubTab === 'shelters' && (
              <div className="border border-neutral-900 bg-neutral-950 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/40 border-b border-neutral-900 text-neutral-400">
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Shelter Name</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Address</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shelters.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono text-xs">
                          No registered shelters found in the database.
                        </td>
                      </tr>
                    ) : (
                      shelters.map(s => (
                        <tr key={s._id} className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors">
                          <td className="p-4 font-bold">{s.name}</td>
                          <td className="p-4 text-neutral-300">{s.address}</td>
                          <td className="p-4 font-mono text-neutral-400">{s.phone}</td>
                          <td className="p-4">
                            <button className="px-2 py-1 border border-neutral-800 rounded text-[10px] text-neutral-400 hover:text-white">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* VETS MANAGEMENT */}
            {activeSubTab === 'vets' && (
              <div className="border border-neutral-900 bg-neutral-950 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/40 border-b border-neutral-900 text-neutral-400">
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Physician</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Clinic</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">License Code</th>
                      <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono text-xs">
                          No registered veterinarians found in the database.
                        </td>
                      </tr>
                    ) : (
                      vets.map(v => (
                        <tr key={v._id} className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors">
                          <td className="p-4 font-bold">{v.name}</td>
                          <td className="p-4 text-neutral-300">{v.clinicName}</td>
                          <td className="p-4 font-mono text-neutral-400">{v.licenseNumber}</td>
                          <td className="p-4 font-mono text-neutral-400">{v.phone}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </main>

    </div>
  );
}
