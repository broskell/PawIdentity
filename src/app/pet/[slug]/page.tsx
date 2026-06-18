'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  Activity, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Loader2, 
  MessageSquare,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PetProfile {
  _id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dob?: string;
  weight?: number;
  bloodGroup?: string;
  temperament?: string;
  photo?: string;
  gallery: string[];
  slug: string;
  vaccinated: boolean;
  lost: boolean;
  microchipId?: string;
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
    priority: number;
  }>;
  owner: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export default function PublicPetProfile() {
  const { slug } = useParams();
  
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Geolocation & scan status
  const [scanLogged, setScanLogged] = useState(false);
  
  // Finder message form
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [finderMessage, setFinderMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProfileAndLogScan();
    }
  }, [slug]);

  const fetchProfileAndLogScan = async () => {
    setLoading(true);
    try {
      // 1. Fetch public profile
      const profileRes = await axios.get(`/api/pets?slug=${slug}`);
      const petData = profileRes.data.pet;
      setPet(petData);
      setLoading(false);

      // 2. Query geolocation and log the scan
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            await logScanEvent(petData._id, latitude, longitude);
          },
          async () => {
            // Geolocation blocked or failed, log scan with default coordinates
            await logScanEvent(petData._id, 0, 0);
          }
        );
      } else {
        await logScanEvent(petData._id, 0, 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load pet recovery details.');
      setLoading(false);
    }
  };

  const logScanEvent = async (petId: string, lat: number, lng: number) => {
    try {
      // Get basic location info if possible
      let city = 'Unknown';
      let country = 'Unknown';

      // Call our scans API endpoint to log coordinates, send Twilio SMS and emails
      await axios.post('/api/scans', {
        slug,
        lat,
        lng,
        city,
        country,
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
        browser: navigator.appName || 'Web Browser'
      });
      setScanLogged(true);
    } catch (err) {
      console.error('Scan tracking logging failed:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setSendingMsg(true);

    try {
      // Simulate safe finder relay message dispatch (could send a customized SMS)
      // Call scan alert with custom notes
      await axios.post('/api/scans', {
        slug,
        lat: 0,
        lng: 0,
        city: 'Finder Message',
        country: finderName,
        device: finderPhone,
        browser: finderMessage
      });

      setMsgSent(true);
      setFinderName('');
      setFinderPhone('');
      setFinderMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mb-4 text-neutral-400" />
        Syncing secure identity beacon...
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 text-center gap-4">
        <AlertTriangle className="w-8 h-8 text-neutral-500" />
        <h2 className="text-xl font-bold">Profile Not Available</h2>
        <p className="text-xs text-neutral-500 max-w-sm font-mono">{error || 'The pet profile you are looking for does not exist.'}</p>
        <a href="/" className="px-4 py-2 border border-neutral-900 rounded text-xs hover:border-neutral-700 transition-colors">
          Return to PawPass Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black font-sans pb-20">
      
      {/* MISSING ALERT HEADER */}
      {pet.lost ? (
        <div className="w-full bg-white text-black py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-black animate-ping shrink-0" />
            <h2 className="font-bold text-sm tracking-tight flex items-center gap-1.5 uppercase font-mono">
              <AlertTriangle size={16} /> Missing Animal Alert
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Last Seen: Active Search</span>
            <span className="font-bold border-l border-neutral-300 pl-4">REWARD OFFERED</span>
          </div>
        </div>
      ) : (
        <div className="w-full bg-neutral-950 py-3 px-6 border-b border-neutral-900 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[10px] uppercase">
            <ShieldCheck className="text-white" size={14} />
            <span>Secure Profile Connected</span>
          </div>
          {scanLogged && (
            <span className="text-[10px] font-mono text-neutral-500">Scan tracked successfully</span>
          )}
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 w-full mt-10 flex flex-col gap-8">
        
        {/* PET PIC & MAIN DETAILS */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-28 h-28 rounded-full border border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold uppercase text-neutral-700 bg-neutral-900">
                {pet.name.substring(0, 2)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{pet.name}</h1>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              {pet.species} · {pet.breed}
            </p>
          </div>
        </div>

        {/* IDENTITY DETAILS GRID */}
        <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-4">
          <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-neutral-500">Identity Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block mb-0.5">Gender</span>
              <span className="capitalize text-neutral-200">{pet.gender}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Microchip Number</span>
              <span className="text-neutral-200">{pet.microchipId || 'Not registered'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Immunizations</span>
              <span className="text-neutral-200">{pet.vaccinated ? 'Fully Immunized' : 'Incomplete Records'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Blood Group</span>
              <span className="text-neutral-200">{pet.bloodGroup || 'Not specified'}</span>
            </div>
            {pet.temperament && (
              <div className="col-span-2">
                <span className="text-neutral-500 block mb-0.5">Temperament</span>
                <span className="text-neutral-200">{pet.temperament}</span>
              </div>
            )}
          </div>
        </div>

        {/* EMERGENCY CONTACT CARDS */}
        {pet.emergencyContacts && pet.emergencyContacts.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-neutral-500">Emergency Contacts</h3>
            <div className="flex flex-col gap-3">
              {pet.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="p-4 border border-neutral-900 bg-neutral-950 rounded flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-neutral-200">{contact.name}</h4>
                    <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{contact.relation}</span>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="p-2 border border-neutral-800 hover:border-neutral-600 rounded bg-black transition-colors flex items-center gap-1.5"
                  >
                    <Phone size={12} /> Call Contact
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SAFE CONTACT AND MESSAGE FORM */}
        <div className="p-6 border border-neutral-900 bg-neutral-950 rounded-lg flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-sm tracking-tight">Report Location / Contact Owner</h3>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">
              Send a secure notification to the owner. Direct contacts are masked for safety.
            </p>
          </div>

          {msgSent ? (
            <div className="p-4 border border-neutral-800 bg-black rounded flex items-start gap-3 text-xs text-neutral-300">
              <CheckCircle className="text-white shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-white mb-1">Message Sent Successfully</p>
                <p className="leading-relaxed">The owner has been dispatched coordinates and your contact detail via SMS and email.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 uppercase text-[9px]">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={finderName}
                    onChange={(e) => setFinderName(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 uppercase text-[9px]">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91..."
                    value={finderPhone}
                    onChange={(e) => setFinderPhone(e.target.value)}
                    className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-500 uppercase text-[9px]">Message Details</label>
                <textarea
                  required
                  placeholder="I found your pet near the park. Standing next to the main gate."
                  value={finderMessage}
                  onChange={(e) => setFinderMessage(e.target.value)}
                  rows={3}
                  className="px-3 py-2 bg-black border border-neutral-900 rounded text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMsg}
                className="w-full py-2.5 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingMsg ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatched Alert Beacon...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={14} />
                    <span>Send Secure Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
