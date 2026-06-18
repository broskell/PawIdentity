'useContext';
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { 
  Plus, 
  QrCode, 
  Settings, 
  Bell, 
  ShieldAlert, 
  Activity, 
  Calendar, 
  Trash2, 
  Edit3, 
  Download, 
  LogOut, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  dob?: string;
  gender: string;
  weight?: number;
  bloodGroup?: string;
  temperament?: string;
  photo?: string;
  slug: string;
  qrUrl?: string;
  vaccinated: boolean;
  lost: boolean;
  microchipId?: string;
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
    priority: number;
  }>;
}

interface Vaccination {
  _id: string;
  vaccineName: string;
  dose: string;
  date: string;
  nextDueDate: string;
  status: string;
  pet: string | any;
}

interface ScanLog {
  _id: string;
  pet: any;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  time: string;
  browser?: string;
}

export default function OwnerDashboard() {
  const { user, dbUser, logout, syncProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'pets' | 'qr' | 'medical' | 'lost' | 'scans' | 'settings'>('overview');
  
  // State lists
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Pet Form state
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Dog');
  const [petBreed, setPetBreed] = useState('');
  const [petGender, setPetGender] = useState('male');
  const [petDob, setPetDob] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petBlood, setPetBlood] = useState('');
  const [petTemp, setPetTemp] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petChip, setPetChip] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Lost Pet Dialog state
  const [selectedPetForLost, setSelectedPetForLost] = useState<Pet | null>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [lastSeenLoc, setLastSeenLoc] = useState('');

  // Profile Form state
  const [profileName, setProfileName] = useState(dbUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(dbUser?.phone || '');
  const [profileCity, setProfileCity] = useState(dbUser?.city || '');
  const [profileState, setProfileState] = useState(dbUser?.state || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pets
      const petsRes = await axios.get('/api/pets');
      setPets(petsRes.data.pets || []);

      // 2. Fetch notifications and scans (mocked aggregate logs for scanning owners)
      // Since scans require pet relationship, we fetch and map
      const petIds = (petsRes.data.pets || []).map((p: Pet) => p._id);
      
      // Load mock scans or query scans endpoint if available
      setScans([
        { _id: '1', pet: { name: 'Bruno' }, city: 'Hyderabad', country: 'India', time: new Date().toISOString(), browser: 'Chrome Mobile' }
      ]);
      
      // Load mock vaccinations
      setVaccinations([
        { _id: 'v1', vaccineName: 'Rabies', dose: '1 ml', date: '2026-01-10', nextDueDate: '2027-01-10', status: 'administered', pet: 'Bruno' }
      ]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contact = contactName && contactPhone ? [{
        name: contactName,
        relation: contactRelation || 'Owner',
        phone: contactPhone,
        priority: 1
      }] : [];

      await axios.post('/api/pets', {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        gender: petGender,
        dob: petDob,
        weight: Number(petWeight) || undefined,
        bloodGroup: petBlood,
        temperament: petTemp,
        photo: petPhoto,
        microchipId: petChip,
        emergencyContacts: contact
      });

      // Reset
      setPetFormOpen(false);
      setPetName('');
      setPetBreed('');
      setPetWeight('');
      setPetDob('');
      setPetBlood('');
      setPetTemp('');
      setPetPhoto('');
      setPetChip('');
      setContactName('');
      setContactRelation('');
      setContactPhone('');

      fetchDashboardData();
    } catch (err) {
      console.error('Error adding pet:', err);
    }
  };

  const handleDeletePet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pet profile? This will delete all associated medical reports.')) return;
    try {
      await axios.delete(`/api/pets/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete pet:', err);
    }
  };

  const handleToggleLost = async (pet: Pet) => {
    if (pet.lost) {
      // Mark as found
      try {
        await axios.put(`/api/pets/${pet._id}`, { lost: false });
        fetchDashboardData();
      } catch (err) {
        console.error(err);
      }
    } else {
      setSelectedPetForLost(pet);
    }
  };

  const submitLostReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetForLost) return;

    try {
      await axios.put(`/api/pets/${selectedPetForLost._id}`, {
        lost: true,
        lostReward: Number(rewardAmount) || 0,
        lostLastSeen: lastSeenLoc,
        lostCoordinates: { lat: 17.406, lng: 78.484 } // Hyderabad default coords or mock
      });
      setSelectedPetForLost(null);
      setRewardAmount('');
      setLastSeenLoc('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    try {
      await syncProfile({
        name: profileName,
        phone: profilePhone,
        city: profileCity,
        state: profileState
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-white selection:text-black">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950 flex flex-col p-6 gap-8">
        <div>
          <h2 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded border border-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter bg-black">
              P
            </span>
            PawPass
          </h2>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Dashboard</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
            { id: 'pets', label: 'My Pets', icon: <Plus size={16} /> },
            { id: 'qr', label: 'QR Smart Tags', icon: <QrCode size={16} /> },
            { id: 'medical', label: 'Medical Timeline', icon: <Calendar size={16} /> },
            { id: 'scans', label: 'Scan History', icon: <Bell size={16} /> },
            { id: 'settings', label: 'Profile Settings', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left ${activeTab === tab.id ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded text-sm transition-colors text-left mt-auto"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 p-10 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-neutral-500">
            Fetching pet ledger files...
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
                  <p className="text-xs text-neutral-500 mt-1">Hello, {dbUser?.name}. Manage your tags and track scan triggers.</p>
                </div>

                {/* STATS MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Total Pets</span>
                    <p className="text-3xl font-bold tracking-tight">{pets.length}</p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Vaccines Due</span>
                    <p className="text-3xl font-bold tracking-tight">
                      {vaccinations.filter(v => new Date(v.nextDueDate) < new Date()).length}
                    </p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Scans Logged</span>
                    <p className="text-3xl font-bold tracking-tight">{scans.length}</p>
                  </div>
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Lost Cases</span>
                    <p className="text-3xl font-bold tracking-tight">{pets.filter(p => p.lost).length}</p>
                  </div>
                </div>

                {/* QUICK VIEW GRID */}
                <div className="border border-neutral-900 bg-neutral-950 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm">Active Identifiers</h3>
                    <button onClick={() => setPetFormOpen(true)} className="px-3 py-1.5 bg-white text-black font-semibold text-xs rounded hover:bg-neutral-200 transition-colors flex items-center gap-1.5">
                      <Plus size={14} /> Register Pet
                    </button>
                  </div>

                  {pets.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                      No pets registered yet. Register your first pet to generate a smart tag.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pets.map(pet => (
                        <div key={pet._id} className="p-4 border border-neutral-900 rounded bg-black flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded border border-neutral-850 bg-neutral-900 overflow-hidden">
                              {pet.photo && <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{pet.name}</h4>
                              <span className="text-[11px] text-neutral-500">{pet.breed} · {pet.gender}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${pet.lost ? 'bg-neutral-900 border-white text-white' : 'border-neutral-850 text-neutral-500'}`}>
                              {pet.lost ? 'MISSING' : 'SECURE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY PETS VIEW */}
            {activeTab === 'pets' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">My Pets</h1>
                    <p className="text-xs text-neutral-500 mt-1">Register and manage pet information cards.</p>
                  </div>
                  <button onClick={() => setPetFormOpen(true)} className="px-4 py-2 bg-white text-black font-semibold text-sm rounded hover:bg-neutral-200 transition-colors flex items-center gap-2">
                    <Plus size={16} /> Register Pet
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pets.map(pet => (
                    <div key={pet._id} className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded border border-neutral-850 bg-neutral-900 overflow-hidden">
                            {pet.photo && <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <p className="text-xs text-neutral-400">{pet.species} ({pet.breed})</p>
                            <span className="text-[10px] font-mono text-neutral-500 block mt-1">Slug: {pet.slug}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeletePet(pet._id)} className="text-neutral-500 hover:text-white transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-neutral-900 pt-4 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Gender</span>
                          <span className="capitalize">{pet.gender}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Weight</span>
                          <span>{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Blood Group</span>
                          <span>{pet.bloodGroup || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Microchip ID</span>
                          <span className="font-mono">{pet.microchipId || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-neutral-900 pt-4 mt-2">
                        <button 
                          onClick={() => handleToggleLost(pet)}
                          className={`flex-1 py-2 rounded text-xs font-semibold border ${pet.lost ? 'bg-white text-black border-white' : 'bg-black border-neutral-850 hover:border-neutral-700 text-white'}`}
                        >
                          {pet.lost ? 'Mark as Found' : 'Mark as Lost'}
                        </button>
                        {pet.qrUrl && (
                          <a 
                            href={pet.qrUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 transition-colors flex items-center justify-center"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR SMART TAGS PANEL */}
            {activeTab === 'qr' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight">QR Smart Tags</h1>
                  <p className="text-xs text-neutral-500 mt-1">Download and print recovery tags to attach to collars.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pets.map(pet => (
                    <div key={pet._id} className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col items-center gap-4 text-center">
                      <h3 className="font-bold text-sm">{pet.name}</h3>
                      <div className="w-40 h-40 bg-white p-2 rounded border border-neutral-900">
                        {pet.qrUrl && <img src={pet.qrUrl} alt={`${pet.name} QR`} className="w-full h-full" />}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{pet.slug}</span>
                      
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = pet.qrUrl || '';
                          link.download = `${pet.name}-tag.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="w-full py-2 bg-neutral-900 border border-neutral-800 rounded text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download size={12} /> Download Smart Tag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDICAL TIMELINE VIEW */}
            {activeTab === 'medical' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight">Medical Timeline</h1>
                  <p className="text-xs text-neutral-500 mt-1">Official immunization and medication timelines, logged by veterinarians.</p>
                </div>

                <div className="flex flex-col gap-6">
                  {pets.map(pet => (
                    <div key={pet._id} className="border border-neutral-900 bg-neutral-950 rounded-lg p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-neutral-900 mb-6">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Activity size={16} /> {pet.name}'s Medical File
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-500">Status: {pet.vaccinated ? 'Immunized' : 'Incomplete Records'}</span>
                      </div>

                      {/* Mock Medical History Timeline */}
                      <div className="relative pl-6 border-l border-neutral-900 flex flex-col gap-8 ml-2">
                        <div className="relative">
                          <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-white border-2 border-black" />
                          <span className="text-[10px] font-mono text-neutral-500 block mb-1">June 2026</span>
                          <h4 className="font-bold text-xs">Rabies Vaccine Dose</h4>
                          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">Administered by: City Vet Hospital. Next Booster: June 2027.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-neutral-800 border-2 border-black" />
                          <span className="text-[10px] font-mono text-neutral-500 block mb-1">May 2026</span>
                          <h4 className="font-bold text-xs">General Health checkup</h4>
                          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">All vitals stable. Declared healthy by Dr. Aneesh.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCAN LOGS */}
            {activeTab === 'scans' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight">Scan History</h1>
                  <p className="text-xs text-neutral-500 mt-1">Real-time coordinates logged when your tags are scanned.</p>
                </div>

                <div className="border border-neutral-900 bg-neutral-950 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-900/40 border-b border-neutral-900 text-neutral-400">
                        <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Pet</th>
                        <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Location</th>
                        <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Time</th>
                        <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Coordinates</th>
                        <th className="p-4 font-mono uppercase tracking-wider text-[10px]">Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map(scan => (
                        <tr key={scan._id} className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors">
                          <td className="p-4 font-bold">{scan.pet.name}</td>
                          <td className="p-4">{scan.city ? `${scan.city}, ${scan.country || ''}` : 'Unknown'}</td>
                          <td className="p-4">{new Date(scan.time).toLocaleTimeString()}</td>
                          <td className="p-4 font-mono text-neutral-400">17.406, 78.484</td>
                          <td className="p-4 text-neutral-400">{scan.browser || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <form onSubmit={handleUpdateProfile} className="max-w-md flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight">Profile Settings</h1>
                  <p className="text-xs text-neutral-500 mt-1">Manage emergency fallback numbers and locations.</p>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded text-xs font-mono flex items-center gap-2">
                    <Check size={14} className="text-neutral-100" />
                    <span>Profile settings updated successfully.</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Emergency Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    placeholder="+91 90302 17599"
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase">City</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase">State</label>
                    <input
                      type="text"
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-sm text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                </div>

                <button type="submit" className="py-2.5 bg-white text-black font-semibold rounded text-sm hover:bg-neutral-200 transition-colors">
                  Save Settings
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* REGISTER PET DIALOG */}
      {petFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-900 rounded-lg p-8 max-h-[85vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
              <h3 className="font-display font-bold text-xl">Register New Pet</h3>
              <button onClick={() => setPetFormOpen(false)} className="text-neutral-500 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleAddPet} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Pet Name *</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Species *</label>
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Breed *</label>
                  <input
                    type="text"
                    value={petBreed}
                    placeholder="German Shepherd, Siamese, etc."
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Gender</label>
                  <select
                    value={petGender}
                    onChange={(e) => setPetGender(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    value={petDob}
                    onChange={(e) => setPetDob(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={petWeight}
                    onChange={(e) => setPetWeight(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Blood Group</label>
                  <input
                    type="text"
                    value={petBlood}
                    placeholder="DEA 1.1, A, B, etc."
                    onChange={(e) => setPetBlood(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Temperament</label>
                  <input
                    type="text"
                    value={petTemp}
                    placeholder="Friendly, protective, shy"
                    onChange={(e) => setPetTemp(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Microchip ID (Optional)</label>
                  <input
                    type="text"
                    value={petChip}
                    onChange={(e) => setPetChip(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="px-3 py-1.5 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              {/* EMERGENCY CONTACT SUB-FIELDS */}
              <div className="border-t border-neutral-900 pt-4 mt-2">
                <h4 className="font-bold text-xs mb-3 text-neutral-300">Backup Emergency Contact Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-neutral-500 uppercase">Contact Name</label>
                    <input
                      type="text"
                      value={contactName}
                      placeholder="Jane Doe"
                      onChange={(e) => setContactName(e.target.value)}
                      className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-neutral-500 uppercase">Relation</label>
                    <input
                      type="text"
                      value={contactRelation}
                      placeholder="Neighbor, Brother"
                      onChange={(e) => setContactRelation(e.target.value)}
                      className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-neutral-500 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      placeholder="+91 90302 17599"
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors mt-4">
                Register Pet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MARK AS LOST DIALOG */}
      {selectedPetForLost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-lg p-8 flex flex-col gap-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="text-white" size={18} /> Mark {selectedPetForLost.name} as Lost
              </h3>
              <button onClick={() => setSelectedPetForLost(null)} className="text-neutral-500 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={submitLostReport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-neutral-500 uppercase">Reward Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-neutral-500 uppercase">Last Seen Location Description</label>
                <input
                  type="text"
                  placeholder="e.g. Jubilee Hills Road No. 36, near Starbucks"
                  value={lastSeenLoc}
                  onChange={(e) => setLastSeenLoc(e.target.value)}
                  className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors mt-2 uppercase tracking-wider font-mono">
                Publish Missing Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
