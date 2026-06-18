'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { 
  Search, 
  Activity, 
  FileText, 
  Plus, 
  Check, 
  PlusCircle, 
  Loader2, 
  LogOut,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dob?: string;
  weight?: number;
  microchipId?: string;
  owner?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface MedicalRecord {
  _id: string;
  vaccines: string[];
  allergies: string[];
  prescriptions: string[];
  surgeries: string[];
  diseases: string[];
  documents: string[];
  notes?: string;
}

interface Vaccination {
  _id: string;
  vaccineName: string;
  dose: string;
  date: string;
  nextDueDate: string;
  status: string;
}

export default function VetDashboard() {
  const { user, dbUser, logout } = useAuth();
  
  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  
  // Patient details state
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingRecord, setLoadingRecord] = useState(false);

  // Form states for medical updates
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDose, setVaccineDose] = useState('1 ml');
  const [vaccineDate, setVaccineDate] = useState('');
  const [vaccineNextDate, setVaccineNextDate] = useState('');
  
  const [prescription, setPrescription] = useState('');
  const [allergy, setAllergy] = useState('');
  const [surgery, setSurgery] = useState('');
  const [disease, setDisease] = useState('');
  const [notes, setNotes] = useState('');
  const [docBase64, setDocBase64] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Auto-search on typing query
  useEffect(() => {
    if (searchQuery.length > 1) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const res = await axios.get(`/api/pets?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.pets || []);
    } catch (err) {
      console.error('Pet search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    setLoadingRecord(true);
    setMedicalRecord(null);
    setVaccinations([]);
    try {
      const res = await axios.get(`/api/medical?petId=${pet._id}`);
      setMedicalRecord(res.data.record);
      setVaccinations(res.data.vaccinations || []);
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMedicalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    setSubmitting(true);
    setActionSuccess(false);

    try {
      const payload: any = {
        petId: selectedPet._id,
        notes: notes || undefined
      };

      if (vaccineName) {
        payload.vaccine = {
          name: vaccineName,
          dose: vaccineDose,
          date: vaccineDate || undefined,
          nextDueDate: vaccineNextDate || undefined
        };
      }

      if (prescription) payload.prescription = prescription;
      if (allergy) payload.allergy = allergy;
      if (surgery) payload.surgery = surgery;
      if (disease) payload.disease = disease;
      if (docBase64) payload.document = docBase64;

      await axios.post('/api/medical', payload);
      
      // Clear forms
      setVaccineName('');
      setVaccineDate('');
      setVaccineNextDate('');
      setPrescription('');
      setAllergy('');
      setSurgery('');
      setDisease('');
      setNotes('');
      setDocBase64('');
      
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 3000);

      // Reload patient record
      handleSelectPet(selectedPet);
    } catch (err) {
      console.error('Failed to update patient record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex selection:bg-white selection:text-black font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-neutral-900 bg-neutral-950 flex flex-col p-6 gap-8 shrink-0">
        <div>
          <h2 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded border border-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter bg-black">
              P
            </span>
            PawPass
          </h2>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Veterinary Panel</span>
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-neutral-500 uppercase">Patient Directory</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search Name, Breed, Microchip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-black border border-neutral-900 rounded text-xs text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        {/* SEARCH RESULTS / PATIENT LIST */}
        <div className="flex flex-col gap-3 flex-grow overflow-y-auto">
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Search Results</span>
          {searching ? (
            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 py-4">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning directories...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-[11px] font-mono text-neutral-500 py-4 leading-relaxed">
              {searchQuery ? 'No matching profiles found.' : 'Enter a query to look up animals.'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults.map((pet) => (
                <button
                  key={pet._id}
                  onClick={() => handleSelectPet(pet)}
                  className={`p-3 border rounded text-left transition-all flex flex-col gap-1 ${
                    selectedPet?._id === pet._id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-black border-neutral-900 text-white hover:border-neutral-700'
                  }`}
                >
                  <span className="font-bold text-xs">{pet.name}</span>
                  <span className={`text-[10px] ${selectedPet?._id === pet._id ? 'text-neutral-600' : 'text-neutral-500'}`}>
                    {pet.species} · {pet.breed}
                  </span>
                  {pet.microchipId && (
                    <span className={`font-mono text-[9px] ${selectedPet?._id === pet._id ? 'text-neutral-500' : 'text-neutral-600'}`}>
                      Chip: {pet.microchipId}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-neutral-900 pt-4 flex flex-col gap-3 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{dbUser?.name}</span>
            <span className="text-[10px] font-mono text-neutral-500">Dr. license {dbUser?.city || 'Registered'}</span>
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

      {/* PATIENT PROFILE AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        {!selectedPet ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 max-w-sm mx-auto">
            <Activity className="w-8 h-8 text-neutral-700" />
            <h3 className="font-bold text-sm">No Patient Selected</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Use the sidebar search tool to fetch a registered pet profile and append professional clinical records.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-neutral-900 pb-6">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                  Active Clinical File
                </span>
                <h1 className="text-3xl font-display font-bold tracking-tight">{selectedPet.name}</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  {selectedPet.species} ({selectedPet.breed}) · {selectedPet.gender}
                </p>
              </div>
              {selectedPet.owner && (
                <div className="text-right p-4 border border-neutral-900 bg-neutral-950 rounded text-xs flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Registered Owner</span>
                  <span className="font-semibold">{selectedPet.owner.name}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{selectedPet.owner.phone || selectedPet.owner.email}</span>
                </div>
              )}
            </div>

            {loadingRecord ? (
              <div className="py-12 text-center text-xs font-mono text-neutral-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing medical database records...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column - History view */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Current profile summary metrics */}
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <FileText size={16} /> Clinical Summary
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Allergies</span>
                        <span className="text-neutral-300">
                          {medicalRecord?.allergies && medicalRecord.allergies.length > 0 
                            ? medicalRecord.allergies.join(', ') 
                            : 'No reported allergies'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Diseases / Status</span>
                        <span className="text-neutral-300">
                          {medicalRecord?.diseases && medicalRecord.diseases.length > 0 
                            ? medicalRecord.diseases.join(', ') 
                            : 'Healthy'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Active Prescriptions</span>
                        <div className="flex flex-col gap-1.5 mt-1.5">
                          {medicalRecord?.prescriptions && medicalRecord.prescriptions.length > 0 ? (
                            medicalRecord.prescriptions.map((p, idx) => (
                              <div key={idx} className="p-2.5 bg-black border border-neutral-900 rounded font-mono text-[11px]">
                                {p}
                              </div>
                            ))
                          ) : (
                            <span className="text-neutral-500">No active prescriptions</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vaccinations ledger list */}
                  <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Calendar size={16} /> Immunization Log
                    </h3>
                    {vaccinations.length === 0 ? (
                      <p className="text-xs text-neutral-500 font-mono py-4">No recorded vaccinations found.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {vaccinations.map((vac) => (
                          <div key={vac._id} className="p-3 border border-neutral-900 bg-black rounded flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold">{vac.vaccineName} ({vac.dose})</p>
                              <span className="text-[10px] text-neutral-500 font-mono">Date: {new Date(vac.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono border border-neutral-800 bg-neutral-900 text-neutral-300">
                                Booster: {new Date(vac.nextDueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Uploaded Documents */}
                  {medicalRecord?.documents && medicalRecord.documents.length > 0 && (
                    <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                      <h3 className="font-bold text-sm">Uploaded Certifications & Reports</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {medicalRecord.documents.map((doc, idx) => (
                          <a 
                            key={idx} 
                            href={doc} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-3 border border-neutral-900 bg-black rounded hover:border-neutral-700 transition-colors text-xs flex items-center justify-between"
                          >
                            <span className="font-mono text-[10px] truncate max-w-[80%]">Report_File_{idx+1}.pdf</span>
                            <Plus size={14} className="text-neutral-500 rotate-45" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column - Entry Forms */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <form onSubmit={handleAddMedicalEntry} className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
                    <h3 className="font-bold text-sm">Add Medical Entry</h3>
                    
                    {actionSuccess && (
                      <div className="p-3 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded text-xs font-mono flex items-center gap-2">
                        <Check size={14} className="text-neutral-100" />
                        <span>Patient ledger updated.</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 text-xs">
                      
                      {/* VACCINATION FIELDS */}
                      <div className="border border-neutral-900 p-4 rounded bg-black flex flex-col gap-3">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Immunization (Vaccine)</span>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-neutral-400">Vaccine Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. DHPP, Rabies, FVRCP"
                            value={vaccineName}
                            onChange={(e) => setVaccineName(e.target.value)}
                            className="px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] text-neutral-400">Date Administered</label>
                            <input 
                              type="date" 
                              value={vaccineDate}
                              onChange={(e) => setVaccineDate(e.target.value)}
                              className="px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] text-neutral-400">Booster Due Date</label>
                            <input 
                              type="date" 
                              value={vaccineNextDate}
                              onChange={(e) => setVaccineNextDate(e.target.value)}
                              className="px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* OTHER MEDICAL DETAILS */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-500 uppercase">Write Prescription</label>
                        <textarea 
                          placeholder="e.g. Amoxicillin 250mg - 1 tablet every 12 hours for 7 days."
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          rows={2}
                          className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-500 uppercase">Allergy</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Penicillin"
                            value={allergy}
                            onChange={(e) => setAllergy(e.target.value)}
                            className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-500 uppercase">Known Disease</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Diabetes"
                            value={disease}
                            onChange={(e) => setDisease(e.target.value)}
                            className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-500 uppercase">Clinical Report File</label>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={handleDocumentUpload}
                          className="px-3 py-1.5 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-500 uppercase">Physician Notes</label>
                        <textarea 
                          placeholder="General observation, progress reports..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-2.5 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating database records...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle size={16} />
                            <span>Commit Entries</span>
                          </>
                        )}
                      </button>

                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>
        )}
      </main>

    </div>
  );
}
