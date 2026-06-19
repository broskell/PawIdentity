import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function PetDetail() {
  const { slug } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [finderMessage, setFinderMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const API_URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '');

  useEffect(() => {
    let active = true;

    const performScan = async () => {
      let coords = { latitude: null, longitude: null };

      const getGeo = () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) return resolve(coords);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            () => resolve(coords),
            { timeout: 5000 }
          );
        });
      };

      const location = await getGeo();

      const ua = navigator.userAgent;
      let device = 'Mobile Device';
      if (/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet/i.test(ua)) {
        device = 'Tablet';
      } else if (/iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
        device = 'Mobile';
      } else if (/macintosh|windows|linux/i.test(ua)) {
        device = 'Desktop';
      }

      let browser = 'Unknown Browser';
      if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
      else if (ua.indexOf('Safari') > -1) browser = 'Safari';
      else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
      else if (ua.indexOf('MSIE') > -1 || !!document.documentMode) browser = 'IE';

      try {
        const res = await axios.post(`${API_URL}/api/scans/${slug}`, {
          latitude: location.latitude,
          longitude: location.longitude,
          device,
          browser,
          city: 'Client Sourced',
          country: 'Geo-lookup'
        });

        if (res.data.success && active) {
          setPet(res.data.pet);
        }
      } catch (err) {
        console.error('Scan logging failed:', err);
        if (active) setError('Could not load pet recovery keys.');
      } finally {
        if (active) setLoading(false);
      }
    };

    performScan();

    return () => {
      active = false;
    };
  }, [slug]);

  const handleFinderSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormSuccess('');
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/lost/${pet._id}/found`, {
        finderName,
        finderPhone,
        finderMessage
      });
      if (res.data.success) {
        setFormSuccess('Notification sent! The owner has been alerted with your contact details.');
        setFinderName('');
        setFinderPhone('');
        setFinderMessage('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-xs font-mono text-secondary">
          Initializing tag recovery process...
        </div>
        <Footer />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-2">
          <h3 className="font-heading font-black text-xl text-white">Profile Not Found</h3>
          <p className="text-secondary text-sm">This smart tag may be deactivated or not yet registered.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isMissing = pet.status === 'missing' || pet.status === 'found';

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
      <Navbar />

      {isMissing && (
        <div className="w-full bg-[#141414] border-y border-[#262626] py-3 text-center text-xs font-mono tracking-widest text-neutral-300 select-none">
          ATTENTION: THIS PET IS REGISTERED AS MISSING. PLEASE HELP BRING THEM HOME.
        </div>
      )}

      <main className="flex-grow max-w-2xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="w-full h-[320px] rounded-[24px] overflow-hidden border border-border bg-surface">
          <img 
            src={pet.photo || '/src/assets/bruno.png'} 
            alt={pet.name} 
            className="w-full h-full object-cover grayscale brightness-90"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-[900] text-3xl tracking-tighter">
              {pet.name}
            </h2>
            <span className="text-[11px] font-mono border border-border px-3 py-1 rounded-full text-white bg-black">
              {pet.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}
            </span>
          </div>
          <p className="text-secondary text-sm font-medium">
            {pet.gender} &middot; {pet.breed || pet.species}
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#141414] pt-6">
          <h3 className="text-xs uppercase tracking-wider text-secondary font-bold">
            Emergency Contacts
          </h3>
          <div className="flex flex-col gap-3">
            {pet.emergencyContacts && pet.emergencyContacts.length > 0 ? (
              pet.emergencyContacts.map((contact, idx) => (
                <div 
                  key={idx}
                  className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-secondary mt-0.5">{contact.relation || 'Relation'}</p>
                  </div>
                  <span className="font-mono text-white font-medium">
                    {contact.phone}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-neutral-600 font-mono text-xs">No emergency contacts listed.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#141414] pt-6 mb-6">
          <h3 className="text-xs uppercase tracking-wider text-secondary font-bold">
            Report Found / Send Sighting
          </h3>
          
          {formSuccess && (
            <div className="text-xs font-mono border border-neutral-800 bg-[#070707] text-neutral-400 p-4 rounded-xl">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleFinderSubmit} className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Your Phone</label>
                <input 
                  type="tel" 
                  required
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Message</label>
              <textarea 
                rows="3"
                value={finderMessage}
                onChange={(e) => setFinderMessage(e.target.value)}
                placeholder="Where is the pet? Any special conditions?"
                className="bg-black border border-border rounded-lg p-4 text-white focus:outline-none focus:border-neutral-500 font-medium resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={formSubmitting}
              className="bg-white text-black font-semibold h-11 rounded-lg hover:bg-neutral-200 transition-colors duration-200 disabled:opacity-50"
            >
              {formSubmitting ? 'Submitting report...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
