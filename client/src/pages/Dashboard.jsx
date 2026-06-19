import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Dashboard() {
  const { dbUser, logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('pets');

  // Add Pet Form State
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petGender, setPetGender] = useState('male');
  const [petDob, setPetDob] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petMicrochip, setPetMicrochip] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petContacts, setPetContacts] = useState([{ name: '', relation: '', phone: '' }]);

  // Add Medical Record State
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [medDiagnosis, setMedDiagnosis] = useState('');
  const [medPrescription, setMedPrescription] = useState('');
  const [medNotes, setMedNotes] = useState('');

  // Add Vaccination State
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vacName, setVacName] = useState('');
  const [vacAdministered, setVacAdministered] = useState('');
  const [vacDue, setVacDue] = useState('');
  const [vacBatch, setVacBatch] = useState('');

  // Report Lost State
  const [showReportLost, setShowReportLost] = useState(false);
  const [lostCity, setLostCity] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostReward, setLostReward] = useState('');
  const [lostDesc, setLostDesc] = useState('');

  // Vet View Search State
  const [searchPetQuery, setSearchPetQuery] = useState('');
  const [foundPet, setFoundPet] = useState(null);
  const [petMedicalHistory, setPetMedicalHistory] = useState([]);

  // Admin View State
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser]);

  const getHeaders = async () => {
    if (!currentUser) return {};
    const token = await currentUser.getIdToken();
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      
      if (dbUser?.role === 'owner') {
        const petRes = await axios.get(`${API_URL}/api/pets`, headers);
        if (petRes.data.success) {
          setPets(petRes.data.pets);
        }
        const notifRes = await axios.get(`${API_URL}/api/notifications`, headers);
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications);
        }
      } else if (dbUser?.role === 'admin') {
        const usersRes = await axios.get(`${API_URL}/api/admin/users`, headers);
        const analRes = await axios.get(`${API_URL}/api/admin/analytics`, headers);
        if (usersRes.data.success) setUsersList(usersRes.data.users);
        if (analRes.data.success) setAnalytics(analRes.data.analytics);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      fetchData();
    }
  }, [dbUser]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Pet Submit
  const handleAddPet = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const headers = await getHeaders();
      const res = await axios.post(`${API_URL}/api/pets`, {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        gender: petGender,
        dob: petDob,
        weight: petWeight ? parseFloat(petWeight) : undefined,
        color: petColor,
        microchipId: petMicrochip,
        photo: petPhoto,
        emergencyContacts: petContacts.filter(c => c.name && c.phone)
      }, headers);

      if (res.data.success) {
        setSuccess('Pet registered successfully!');
        setShowAddPet(false);
        setPetName('');
        setPetBreed('');
        setPetWeight('');
        setPetColor('');
        setPetMicrochip('');
        setPetPhoto('');
        setPetContacts([{ name: '', relation: '', phone: '' }]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError('Could not create pet profile.');
    }
  };

  // Add Medical Record Submit
  const handleAddRecord = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const headers = await getHeaders();
      const res = await axios.post(`${API_URL}/api/medical`, {
        petId: selectedPetId,
        diagnosis: medDiagnosis,
        prescription: medPrescription,
        notes: medNotes
      }, headers);

      if (res.data.success) {
        setSuccess('Medical record added!');
        setShowAddRecord(false);
        setMedDiagnosis('');
        setMedPrescription('');
        setMedNotes('');
        if (foundPet && selectedPetId === foundPet._id) {
          handleSearchPet();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not add record.');
    }
  };

  // Add Vaccination Submit
  const handleAddVaccine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const headers = await getHeaders();
      const res = await axios.post(`${API_URL}/api/vaccinations`, {
        petId: selectedPetId,
        vaccineName: vacName,
        dateAdministered: vacAdministered,
        nextDueDate: vacDue,
        batchNumber: vacBatch
      }, headers);

      if (res.data.success) {
        setSuccess('Vaccination recorded successfully!');
        setShowAddVaccine(false);
        setVacName('');
        setVacBatch('');
        if (foundPet && selectedPetId === foundPet._id) {
          handleSearchPet();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not record vaccination.');
    }
  };

  // Report Lost Submit
  const handleReportLost = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const headers = await getHeaders();
      const res = await axios.post(`${API_URL}/api/lost`, {
        petId: selectedPetId,
        lastSeenCity: lostCity,
        lastSeenLocation: lostLocation,
        reward: lostReward ? parseFloat(lostReward) : 0,
        description: lostDesc
      }, headers);

      if (res.data.success) {
        setSuccess('Pet reported as missing.');
        setShowReportLost(false);
        setLostCity('');
        setLostLocation('');
        setLostReward('');
        setLostDesc('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError('Could not file missing pet report.');
    }
  };

  const handleCloseCase = async (petId) => {
    setError('');
    setSuccess('');
    try {
      const headers = await getHeaders();
      const res = await axios.post(`${API_URL}/api/lost/${petId}/close`, {}, headers);
      if (res.data.success) {
        setSuccess('Recovery case closed!');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to close recovery case.');
    }
  };

  // Vet search
  const handleSearchPet = async () => {
    if (!searchPetQuery) return;
    setError('');
    try {
      const headers = await getHeaders();
      const res = await axios.get(`${API_URL}/api/lost`, {
        params: { search: searchPetQuery }
      });
      if (res.data.success && res.data.lostPets.length > 0) {
        const found = res.data.lostPets[0].pet;
        setFoundPet(found);
        setSelectedPetId(found._id);
        
        const medRes = await axios.get(`${API_URL}/api/medical/${found._id}`, headers);
        if (medRes.data.success) {
          setPetMedicalHistory(medRes.data.records);
        }
      } else {
        setError('No pets matching query found.');
        setFoundPet(null);
      }
    } catch (err) {
      console.error(err);
      setError('Search lookup failed.');
    }
  };

  // Admin role sync
  const handleUpdateRole = async (userId, role) => {
    try {
      const headers = await getHeaders();
      await axios.put(`${API_URL}/api/admin/role`, { userId, role }, headers);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const headers = await getHeaders();
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, headers);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-xs font-mono text-secondary">
          Connecting secure keys...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 flex flex-col gap-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141414] pb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">
              Secured Console &middot; {dbUser?.role}
            </span>
            <h2 className="font-heading font-black text-3xl tracking-tighter">
              {dbUser?.name}
            </h2>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-transparent border border-border text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-surface transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="text-xs font-mono border border-neutral-800 bg-[#070707] text-neutral-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs font-mono border border-neutral-800 bg-[#070707] text-neutral-400 p-4 rounded-xl">
            {success}
          </div>
        )}

        {/* ============================================================== */}
        {/* OWNER VIEW */}
        {/* ============================================================== */}
        {dbUser?.role === 'owner' && (
          <div className="flex flex-col gap-6">
            
            <div className="flex gap-4 border-b border-[#141414] text-xs font-semibold uppercase tracking-wider text-secondary">
              <button 
                onClick={() => setActiveTab('pets')}
                className={`pb-3 ${activeTab === 'pets' ? 'text-white border-b border-white' : ''}`}
              >
                Pets & Tags
              </button>
              <button 
                onClick={() => setActiveTab('alerts')}
                className={`pb-3 ${activeTab === 'alerts' ? 'text-white border-b border-white' : ''}`}
              >
                Scan Notifications ({notifications.filter(n => n.status === 'unread').length})
              </button>
            </div>

            {activeTab === 'pets' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-lg text-white">Registered Digital Keys</h3>
                  <button 
                    onClick={() => setShowAddPet(true)}
                    className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    Add Pet
                  </button>
                </div>

                {pets.length === 0 ? (
                  <div className="text-center py-20 text-neutral-600 font-mono text-xs border border-dashed border-border rounded-xl">
                    No keys registered. Register a pet to generate a smart recovery tag.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pets.map(({ pet, qrTag }) => (
                      <div 
                        key={pet._id}
                        className="bg-surface border border-border rounded-[20px] p-6 flex flex-col sm:flex-row gap-6"
                      >
                        <div className="w-[120px] h-[120px] rounded-lg overflow-hidden border border-border bg-black flex-shrink-0">
                          <img 
                            src={pet.photo || '/src/assets/bruno.png'} 
                            alt={pet.name} 
                            className="w-full h-full object-cover grayscale brightness-90"
                          />
                        </div>

                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-black text-xl text-white">{pet.name}</h4>
                              <span className="text-[9px] font-mono border border-border px-2 py-0.5 rounded-full text-white bg-black">
                                {pet.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-secondary text-xs">{pet.breed || pet.species}</p>
                            {pet.microchipId && (
                              <p className="text-[10px] font-mono text-neutral-500 mt-1">Microchip: {pet.microchipId}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-4">
                            {qrTag?.qrImage && (
                              <a 
                                href={qrTag.qrImage}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-transparent border border-border text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                              >
                                View QR
                              </a>
                            )}
                            
                            {pet.status === 'active' ? (
                              <button 
                                onClick={() => {
                                  setSelectedPetId(pet._id);
                                  setShowReportLost(true);
                                }}
                                className="bg-white text-black text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                Report Lost
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleCloseCase(pet._id)}
                                className="bg-transparent border border-neutral-700 text-neutral-400 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                              >
                                Mark Found
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="flex flex-col gap-4">
                <h3 className="font-heading font-bold text-lg text-white font-heading">Security Activity Logs</h3>
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-neutral-600 font-mono text-xs border border-dashed border-border rounded-xl">
                    No logs recorded.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {notifications.map((n) => (
                      <div 
                        key={n._id}
                        className={`border rounded-xl p-4 flex justify-between items-center text-xs ${
                          n.status === 'unread' ? 'bg-surface border-white/20' : 'bg-black border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-white">{n.title}</p>
                          <p className="text-secondary">{n.message}</p>
                          {n.metadata?.city && (
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Location: {n.metadata.city}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-neutral-500">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {n.status === 'unread' && (
                            <button 
                              onClick={() => markNotificationAsRead(n._id)}
                              className="text-[10px] font-bold text-white underline underline-offset-2"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VET VIEW */}
        {/* ============================================================== */}
        {dbUser?.role === 'vet' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-lg text-white">Veterinary Registry Panel</h3>
            
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="Search Pet by Name..."
                value={searchPetQuery}
                onChange={(e) => setSearchPetQuery(e.target.value)}
                className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium flex-grow text-sm"
              />
              <button 
                onClick={handleSearchPet}
                className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
              >
                Search
              </button>
            </div>

            {foundPet && (
              <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 mt-4">
                
                <div className="flex justify-between items-center pb-4 border-b border-[#141414]">
                  <div>
                    <h4 className="font-heading font-black text-2xl text-white">{foundPet.name}</h4>
                    <p className="text-secondary text-sm">{foundPet.breed || foundPet.species}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setSelectedPetId(foundPet._id);
                        setShowAddRecord(true);
                      }}
                      className="bg-transparent border border-border text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-black transition-colors"
                    >
                      Add Medical Log
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPetId(foundPet._id);
                        setShowAddVaccine(true);
                      }}
                      className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      Add Vaccination
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h5 className="text-xs uppercase tracking-wider text-secondary font-bold">Medical History Log</h5>
                  {petMedicalHistory.length === 0 ? (
                    <p className="text-xs text-neutral-600 font-mono">No medical logs registered.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {petMedicalHistory.map((m) => (
                        <div key={m._id} className="bg-black border border-border p-4 rounded-xl text-xs flex flex-col gap-2">
                          <div className="flex justify-between font-semibold border-b border-border pb-2">
                            <span className="text-white">Diagnosis: {m.diagnosis}</span>
                            <span className="text-secondary font-mono text-[9px]">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {m.prescription && (
                            <p className="text-neutral-300"><strong className="text-secondary font-semibold">Prescription:</strong> {m.prescription}</p>
                          )}
                          {m.notes && (
                            <p className="text-neutral-400 mt-1"><strong className="text-secondary font-semibold">Notes:</strong> {m.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SHELTER VIEW */}
        {/* ============================================================== */}
        {dbUser?.role === 'shelter' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-lg text-white">Animal Shelter Hub</h3>
            <div className="flex justify-between items-center pb-4 border-b border-[#141414]">
              <p className="text-secondary text-sm">Register found, strays or missing rescues under the shelter database.</p>
              <button 
                onClick={() => setShowAddPet(true)}
                className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors"
              >
                Register Rescue
              </button>
            </div>
            
            <div className="text-center py-20 text-neutral-600 font-mono text-xs border border-dashed border-border rounded-xl">
              No rescue animals currently in shelter registry.
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADMIN VIEW */}
        {/* ============================================================== */}
        {dbUser?.role === 'admin' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-mono uppercase tracking-wider font-bold">Total Accounts</span>
                <span className="font-heading font-black text-3xl text-white font-mono">{analytics?.totalUsers || 0}</span>
              </div>
              <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-mono uppercase tracking-wider font-bold">Pets Synced</span>
                <span className="font-heading font-black text-3xl text-white font-mono">{analytics?.totalPets || 0}</span>
              </div>
              <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-mono uppercase tracking-wider font-bold">Missing Now</span>
                <span className="font-heading font-black text-3xl text-white font-mono">{analytics?.missingPets || 0}</span>
              </div>
              <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-mono uppercase tracking-wider font-bold">Total Scans</span>
                <span className="font-heading font-black text-3xl text-white font-mono">{analytics?.totalScans || 0}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#141414] pt-6">
              <h3 className="font-heading font-bold text-lg text-white">Platform Users Control Table</h3>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden overflow-x-auto text-sm text-left">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-secondary text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Registered Role</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr._id} className="border-b border-border hover:bg-black/50">
                        <td className="p-4 font-semibold text-white">{usr.name}</td>
                        <td className="p-4 text-secondary font-mono text-xs">{usr.email}</td>
                        <td className="p-4 text-white text-xs">{usr.role}</td>
                        <td className="p-4">
                          <select 
                            value={usr.role}
                            onChange={(e) => handleUpdateRole(usr._id, e.target.value)}
                            className="bg-black border border-border rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-neutral-500"
                          >
                            <option value="owner">Owner</option>
                            <option value="vet">Vet</option>
                            <option value="shelter">Shelter</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL FORMS */}
        {/* ============================================================== */}
        
        {/* Modal: Add Pet */}
        {showAddPet && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 select-none">
            <div className="bg-surface border border-border max-w-[500px] w-full p-8 rounded-[24px] flex flex-col gap-6 text-sm max-h-[85vh] overflow-y-auto">
              <h3 className="font-heading font-[900] text-xl text-white tracking-tight">Register Pet Identity</h3>
              <form onSubmit={handleAddPet} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Pet Name</label>
                  <input 
                    type="text" required value={petName} onChange={(e) => setPetName(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Species</label>
                    <select 
                      value={petSpecies} onChange={(e) => setPetSpecies(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-3 text-white focus:outline-none"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Breed</label>
                    <input 
                      type="text" required value={petBreed} onChange={(e) => setPetBreed(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Weight (kg)</label>
                    <input 
                      type="number" step="0.1" value={petWeight} onChange={(e) => setPetWeight(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Color</label>
                    <input 
                      type="text" value={petColor} onChange={(e) => setPetColor(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Microchip ID</label>
                    <input 
                      type="text" value={petMicrochip} onChange={(e) => setPetMicrochip(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Gender</label>
                    <select 
                      value={petGender} onChange={(e) => setPetGender(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-3 text-white focus:outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Date of Birth</label>
                    <input 
                      type="date" required value={petDob} onChange={(e) => setPetDob(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Photo</label>
                  <input 
                    type="file" accept="image/*" onChange={handlePhotoUpload}
                    className="bg-black border border-border rounded-lg h-10 p-1.5 text-white focus:outline-none text-xs font-mono"
                  />
                </div>

                <div className="border-t border-[#141414] pt-4">
                  <label className="text-secondary text-xs uppercase tracking-wider font-bold block mb-3">Emergency Contacts</label>
                  {petContacts.map((contact, idx) => (
                    <div key={idx} className="flex gap-3 mb-2">
                      <input 
                        type="text" placeholder="Name" required
                        value={contact.name} onChange={(e) => {
                          const updated = [...petContacts];
                          updated[idx].name = e.target.value;
                          setPetContacts(updated);
                        }}
                        className="bg-black border border-border rounded-lg h-9 px-3 text-xs w-1/3 text-white focus:outline-none"
                      />
                      <input 
                        type="text" placeholder="Relation"
                        value={contact.relation} onChange={(e) => {
                          const updated = [...petContacts];
                          updated[idx].relation = e.target.value;
                          setPetContacts(updated);
                        }}
                        className="bg-black border border-border rounded-lg h-9 px-3 text-xs w-1/3 text-white focus:outline-none"
                      />
                      <input 
                        type="tel" placeholder="Phone" required
                        value={contact.phone} onChange={(e) => {
                          const updated = [...petContacts];
                          updated[idx].phone = e.target.value;
                          setPetContacts(updated);
                        }}
                        className="bg-black border border-border rounded-lg h-9 px-3 text-xs w-1/3 text-white focus:outline-none font-mono"
                      />
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => setPetContacts([...petContacts, { name: '', relation: '', phone: '' }])}
                    className="text-xs font-mono text-neutral-400 mt-1 hover:text-white"
                  >
                    + Add Contact
                  </button>
                </div>

                <div className="flex gap-4 mt-2">
                  <button 
                    type="submit"
                    className="bg-white text-black font-semibold h-11 rounded-lg flex-grow hover:bg-neutral-200 transition-colors"
                  >
                    Save Key
                  </button>
                  <button 
                    type="button" onClick={() => setShowAddPet(false)}
                    className="bg-transparent border border-border text-white font-medium h-11 px-6 rounded-lg hover:bg-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Medical Record */}
        {showAddRecord && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 select-none">
            <div className="bg-surface border border-border max-w-[420px] w-full p-8 rounded-[24px] flex flex-col gap-6 text-sm">
              <h3 className="font-heading font-[900] text-xl tracking-tight text-white">Append Medical Log</h3>
              <form onSubmit={handleAddRecord} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Diagnosis</label>
                  <input 
                    type="text" required value={medDiagnosis} onChange={(e) => setMedDiagnosis(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Prescription</label>
                  <input 
                    type="text" value={medPrescription} onChange={(e) => setMedPrescription(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Notes</label>
                  <textarea 
                    rows="3" required value={medNotes} onChange={(e) => setMedNotes(e.target.value)}
                    className="bg-black border border-border rounded-lg p-4 text-white focus:outline-none resize-none"
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  <button 
                    type="submit"
                    className="bg-white text-black font-semibold h-11 rounded-lg flex-grow hover:bg-neutral-200 transition-colors"
                  >
                    Append Log
                  </button>
                  <button 
                    type="button" onClick={() => setShowAddRecord(false)}
                    className="bg-transparent border border-border text-white font-medium h-11 px-6 rounded-lg hover:bg-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Vaccination */}
        {showAddVaccine && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 select-none">
            <div className="bg-surface border border-border max-w-[420px] w-full p-8 rounded-[24px] flex flex-col gap-6 text-sm">
              <h3 className="font-heading font-[900] text-xl tracking-tight text-white">Record Vaccination</h3>
              <form onSubmit={handleAddVaccine} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Vaccine Name</label>
                  <input 
                    type="text" required value={vacName} onChange={(e) => setVacName(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Date Administered</label>
                    <input 
                      type="date" required value={vacAdministered} onChange={(e) => setVacAdministered(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-3 text-white focus:outline-none font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Next Due Date</label>
                    <input 
                      type="date" value={vacDue} onChange={(e) => setVacDue(e.target.value)}
                      className="bg-black border border-border rounded-lg h-10 px-3 text-white focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Batch Number</label>
                  <input 
                    type="text" value={vacBatch} onChange={(e) => setVacBatch(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  <button 
                    type="submit"
                    className="bg-white text-black font-semibold h-11 rounded-lg flex-grow hover:bg-neutral-200 transition-colors"
                  >
                    Record Vaccine
                  </button>
                  <button 
                    type="button" onClick={() => setShowAddVaccine(false)}
                    className="bg-transparent border border-border text-white font-medium h-11 px-6 rounded-lg hover:bg-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Report Lost */}
        {showReportLost && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 select-none">
            <div className="bg-surface border border-border max-w-[420px] w-full p-8 rounded-[24px] flex flex-col gap-6 text-sm">
              <h3 className="font-heading font-[900] text-xl tracking-tight text-white">Create Recovery Alert</h3>
              <form onSubmit={handleReportLost} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">City</label>
                  <input 
                    type="text" required value={lostCity} onChange={(e) => setLostCity(e.target.value)}
                    className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Last Seen Location</label>
                    <input 
                      type="text" value={lostLocation} onChange={(e) => setLostLocation(e.target.value)}
                      placeholder="e.g. Central Park"
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Reward (₹)</label>
                    <input 
                      type="number" value={lostReward} onChange={(e) => setLostReward(e.target.value)}
                      placeholder="e.g. 5000"
                      className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Description</label>
                  <textarea 
                    rows="3" required value={lostDesc} onChange={(e) => setLostDesc(e.target.value)}
                    placeholder="Provide details on collar color, behavior details, etc."
                    className="bg-black border border-border rounded-lg p-4 text-white focus:outline-none resize-none"
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  <button 
                    type="submit"
                    className="bg-white text-black font-semibold h-11 rounded-lg flex-grow hover:bg-neutral-200 transition-colors"
                  >
                    Publish Sighting
                  </button>
                  <button 
                    type="button" onClick={() => setShowReportLost(false)}
                    className="bg-transparent border border-border text-white font-medium h-11 px-6 rounded-lg hover:bg-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
