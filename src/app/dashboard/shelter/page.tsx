'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { 
  Plus, 
  QrCode, 
  Activity, 
  Trash2, 
  Download, 
  LogOut, 
  Check, 
  Home,
  Heart,
  UserCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dob?: string;
  weight?: number;
  photo?: string;
  slug: string;
  qrUrl?: string;
  vaccinated: boolean;
  lost: boolean;
  microchipId?: string;
  adoptionStatus?: 'adoptable' | 'fostered' | 'reunited';
}

export default function ShelterDashboard() {
  const { user, dbUser, logout } = useAuth();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Register Pet Dialog
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Dog');
  const [petBreed, setPetBreed] = useState('');
  const [petGender, setPetGender] = useState('unknown');
  const [petDob, setPetDob] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petChip, setPetChip] = useState('');

  // Shelter specific status
  const [adoptionStatuses, setAdoptionStatuses] = useState<Record<string, 'adoptable' | 'fostered' | 'reunited'>>({});

  useEffect(() => {
    fetchRescues();
  }, []);

  const fetchRescues = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/pets');
      const loadedPets = res.data.pets || [];
      setPets(loadedPets);

      // Initialize statuses (using local storage fallback if the database field is optional)
      const statuses: Record<string, 'adoptable' | 'fostered' | 'reunited'> = {};
      loadedPets.forEach((p: Pet) => {
        statuses[p._id] = p.adoptionStatus || 'adoptable';
      });
      setAdoptionStatuses(statuses);
    } catch (err) {
      console.error('Failed to fetch rescues:', err);
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

  const handleRegisterRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/pets', {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        gender: petGender,
        dob: petDob || undefined,
        weight: Number(petWeight) || undefined,
        photo: petPhoto || undefined,
        microchipId: petChip || undefined
      });

      // Clear Form
      setPetFormOpen(false);
      setPetName('');
      setPetBreed('');
      setPetGender('unknown');
      setPetDob('');
      setPetWeight('');
      setPetPhoto('');
      setPetChip('');

      fetchRescues();
    } catch (err) {
      console.error('Failed to register rescue:', err);
    }
  };

  const handleDeleteRescue = async (id: string) => {
    if (!confirm('Remove this rescue profile? All metadata will be deleted.')) return;
    try {
      await axios.delete(`/api/pets/${id}`);
      fetchRescues();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (petId: string, status: 'adoptable' | 'fostered' | 'reunited') => {
    // Optimistic UI update
    setAdoptionStatuses(prev => ({
      ...prev,
      [petId]: status
    }));

    try {
      // Send to update endpoint
      await axios.put(`/api/pets/${petId}`, {
        temperament: `Status: ${status.toUpperCase()}`, // fallback to store in temperament for searchability
        adoptionStatus: status
      });
    } catch (err) {
      console.error('Failed to update rescue status:', err);
    }
  };

  // Stats calculation
  const totalRescued = pets.length;
  const adoptableCount = Object.values(adoptionStatuses).filter(s => s === 'adoptable').length;
  const fosteredCount = Object.values(adoptionStatuses).filter(s => s === 'fostered').length;
  const reunitedCount = Object.values(adoptionStatuses).filter(s => s === 'reunited').length;

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
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Rescue Shelter</span>
        </div>

        <nav className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Shelter Name</span>
            <span className="text-sm font-semibold truncate">{dbUser?.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Location</span>
            <span className="text-xs text-neutral-400">{dbUser?.city ? `${dbUser.city}, ${dbUser.state || ''}` : 'Not Specified'}</span>
          </div>
        </nav>

        <div className="border-t border-neutral-900 pt-6 flex flex-col gap-4 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded text-sm transition-colors text-left"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SHELTER DASHBOARD BODY */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Shelter Dashboard</h1>
              <p className="text-xs text-neutral-500 mt-1">Manage rescued animals, update availability, and print QR Smart Tags.</p>
            </div>
            <button 
              onClick={() => setPetFormOpen(true)} 
              className="px-4 py-2 bg-white text-black font-semibold text-sm rounded hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} /> Register Animal
            </button>
          </div>

          {/* COUNTERS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Total Rescued</span>
              <p className="text-3xl font-bold tracking-tight">{totalRescued}</p>
            </div>
            <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 flex items-center gap-1.5 text-neutral-400">
                <Heart size={10} /> Adoptable
              </span>
              <p className="text-3xl font-bold tracking-tight">{adoptableCount}</p>
            </div>
            <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 flex items-center gap-1.5 text-neutral-400">
                <Home size={10} /> Fostered
              </span>
              <p className="text-3xl font-bold tracking-tight">{fosteredCount}</p>
            </div>
            <div className="p-6 border border-neutral-900 bg-neutral-950 rounded">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 flex items-center gap-1.5 text-neutral-400">
                <UserCheck size={10} /> Reunited
              </span>
              <p className="text-3xl font-bold tracking-tight">{reunitedCount}</p>
            </div>
          </div>

          {/* LIST */}
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching shelter registry files...</span>
            </div>
          ) : pets.length === 0 ? (
            <div className="border border-neutral-900 bg-neutral-950 rounded-lg p-12 text-center">
              <p className="text-neutral-500 font-mono text-xs mb-4">No rescued animals registered under this shelter.</p>
              <button 
                onClick={() => setPetFormOpen(true)} 
                className="px-4 py-2 border border-neutral-800 rounded text-xs hover:border-neutral-700 transition-colors"
              >
                Register First Animal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pets.map((pet) => {
                const currentStatus = adoptionStatuses[pet._id] || 'adoptable';
                return (
                  <div key={pet._id} className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded border border-neutral-850 bg-neutral-900 overflow-hidden shrink-0">
                          {pet.photo ? (
                            <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-700 font-bold text-xs uppercase">
                              {pet.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{pet.name}</h3>
                          <p className="text-xs text-neutral-400">{pet.species} ({pet.breed})</p>
                          <span className="text-[10px] font-mono text-neutral-500 block mt-1">Slug: {pet.slug}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteRescue(pet._id)} 
                        className="text-neutral-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-neutral-900 pt-4">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Gender</span>
                        <span className="capitalize">{pet.gender}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Microchip ID</span>
                        <span className="font-mono">{pet.microchipId || 'None'}</span>
                      </div>
                    </div>

                    {/* STATUS TOGGLE CONTROLS */}
                    <div className="border-t border-neutral-900 pt-4 mt-2 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">Rescue/Adoption Status</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['adoptable', 'fostered', 'reunited'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(pet._id, status)}
                            className={`py-1.5 rounded text-[10px] font-semibold border capitalize transition-all ${
                              currentStatus === status
                                ? 'bg-white text-black border-white'
                                : 'bg-black border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-850'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* QR ACTION */}
                    <div className="flex gap-2 border-t border-neutral-900 pt-4 mt-2">
                      {pet.qrUrl && (
                        <a
                          href={pet.qrUrl}
                          download={`${pet.name}-tag.png`}
                          className="flex-1 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download size={12} /> Download Smart Tag
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* REGISTER RESCUE DIALOG */}
      {petFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-900 rounded-lg p-8 max-h-[85vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
              <h3 className="font-display font-bold text-xl">Register Rescued Animal</h3>
              <button onClick={() => setPetFormOpen(false)} className="text-neutral-500 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleRegisterRescue} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Animal Name *</label>
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
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700 font-semibold"
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
                  <label className="font-mono text-neutral-500 uppercase">Breed / Description *</label>
                  <input
                    type="text"
                    value={petBreed}
                    placeholder="e.g. Mixed breed, Indie, Husky"
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
                  <label className="font-mono text-neutral-500 uppercase">Estimated Age / DOB</label>
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
                  <label className="font-mono text-neutral-500 uppercase">Microchip ID (If scanned)</label>
                  <input
                    type="text"
                    value={petChip}
                    onChange={(e) => setPetChip(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 uppercase">Photo Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="px-3 py-1.5 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors mt-4">
                Register Rescue Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
