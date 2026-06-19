import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Lost() {
  const [lostPets, setLostPets] = useState([]);
  const [search, setSearch] = useState('');
  const [lastSeenCity, setLastSeenCity] = useState('');
  const [breed, setBreed] = useState('');
  const [species, setSpecies] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  const fetchLostPets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lost`, {
        params: { search, lastSeenCity, breed, species }
      });
      if (res.data.success) {
        setLostPets(res.data.lostPets);
      }
    } catch (error) {
      console.error('Error fetching lost pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostPets();
  }, [search, lastSeenCity, breed, species]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-body select-none">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase text-neutral-600 font-bold tracking-widest">
            Missing Registry
          </span>
          <h2 className="font-heading font-black text-4xl tracking-tighter">
            LOST & FOUND
          </h2>
          <p className="text-secondary text-sm max-w-lg">
            A real-time list of missing pets. A single scan or sighting can bring them home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface border border-border p-4 rounded-xl text-sm">
          <input 
            type="text"
            placeholder="Search Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
          />
          <input 
            type="text"
            placeholder="City..."
            value={lastSeenCity}
            onChange={(e) => setLastSeenCity(e.target.value)}
            className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
          />
          <input 
            type="text"
            placeholder="Breed..."
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="bg-black border border-border rounded-lg h-10 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
          />
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="bg-black border border-border rounded-lg h-10 px-3 text-white focus:outline-none focus:border-neutral-500 font-medium"
          >
            <option value="">All Species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-secondary font-mono text-xs">
            Querying databases...
          </div>
        ) : lostPets.length === 0 ? (
          <div className="text-center py-20 text-neutral-600 font-mono text-xs border border-dashed border-border rounded-xl">
            No missing pets matching search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostPets.map((record) => (
              <div 
                key={record._id}
                className="bg-surface border border-border rounded-[20px] p-5 flex flex-col gap-4"
              >
                <div className="w-full h-[220px] rounded-lg overflow-hidden border border-border bg-black">
                  <img 
                    src={record.pet.photo || '/src/assets/bruno.png'} 
                    alt={record.pet.name} 
                    className="w-full h-full object-cover grayscale brightness-90"
                  />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-black text-xl tracking-tight">
                      {record.pet.name}
                    </h3>
                    <p className="text-secondary text-xs mt-0.5">
                      {record.pet.breed || record.pet.species}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono border border-border px-2.5 py-1 rounded-full text-white bg-black">
                    MISSING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[#141414] pt-4 text-xs">
                  <div>
                    <span className="text-secondary uppercase tracking-wider text-[9px] font-bold block mb-1">
                      Last Seen
                    </span>
                    <span className="font-medium text-white block">
                      {record.lastSeenCity}
                    </span>
                  </div>
                  {record.reward > 0 && (
                    <div>
                      <span className="text-secondary uppercase tracking-wider text-[9px] font-bold block mb-1">
                        Reward
                      </span>
                      <span className="font-mono text-white block">
                        ₹{record.reward}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#141414] pt-4 flex gap-3">
                  <Link 
                    to={`/pet/${record.pet.slug}`}
                    className="w-full bg-white text-black font-semibold text-xs h-10 flex items-center justify-center rounded-lg hover:bg-neutral-200 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
