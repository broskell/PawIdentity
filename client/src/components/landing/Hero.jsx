import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import brunoImg from '../../assets/bruno.png';

export default function Hero() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6 py-20 select-none font-body gap-8">
      {/* Tagline Badge */}
      <div className="font-mono text-xs text-secondary uppercase tracking-[0.25em] bg-surface border border-border px-4 py-1.5 rounded-full select-none">
        Every Pet Deserves An Identity.
      </div>

      {/* Title */}
      <h1 className="font-heading font-[900] text-white text-[clamp(4.5rem,9vw,8rem)] leading-[0.9] tracking-[-0.05em] max-w-5xl">
        One Scan Away<br />From Home.
      </h1>

      {/* Subtitle */}
      <p className="text-secondary text-base md:text-lg max-w-[700px] leading-relaxed">
        A secure identity, medical history, and a way back home.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <Link 
          to="/auth?mode=register" 
          className="bg-white text-black font-semibold h-12 px-8 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors duration-200 min-w-[180px]"
        >
          Register Pet
        </Link>
        <Link 
          to="/lost" 
          className="bg-transparent border border-border text-white font-medium h-12 px-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors duration-200 min-w-[180px]"
        >
          Scan QR
        </Link>
      </div>

      {/* Side-by-Side container for Tag and Preview */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-6 w-full max-w-4xl">
        
        {/* QR Tag (Monochrome Black Aluminum Symbol) */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="w-[240px] h-[360px] bg-surface border border-border rounded-[24px] p-6 flex flex-col justify-between items-center text-white flex-shrink-0"
        >
          <span className="text-[10px] tracking-[0.2em] font-heading font-black text-secondary">
            PAWIDENTITY
          </span>
          
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-heading font-[900] text-2xl tracking-tighter">
              BRUNO
            </h3>
            <span className="text-[8px] tracking-[0.1em] text-secondary">
              SCAN TO IDENTIFY
            </span>
          </div>

          {/* Mock QR Code (Minimalist Monochrome Vector) */}
          <div className="w-32 h-32 bg-black border border-border p-2 rounded-xl flex items-center justify-center">
            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeWidth="2" d="M3 3h6v6H3V3zm12 0h6v6h-6V3zm0 12h6v6h-6v-6zM3 15h6v6H3v-6zm6 0h3m0 3v3m3-6v3m3-3h3M9 9h3M3 9v3m12-3v3m6 0v3m-6 3h3" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1 text-[10px] font-mono text-secondary">
            <span>PID-2026-001</span>
            <span className="text-[8px] tracking-[0.15em] font-heading text-neutral-600 uppercase font-bold">
              Lost & Loved
            </span>
          </div>
        </motion.div>

        {/* Pet Preview (Calm Black Card) */}
        <div className="w-[280px] sm:w-[300px] bg-surface border border-border rounded-[20px] overflow-hidden p-5 flex flex-col gap-4 text-left flex-shrink-0">
          <div className="w-full h-[200px] rounded-lg overflow-hidden border border-border bg-black">
            <img 
              src={brunoImg} 
              alt="Bruno the Golden Retriever" 
              className="w-full h-full object-cover grayscale brightness-95 object-center"
            />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-bold text-lg font-heading">Bruno</h4>
              <p className="text-secondary text-sm">Golden Retriever</p>
            </div>
            <span className="text-[11px] font-mono border border-border px-2.5 py-1 rounded-full text-white bg-black">
              Vaccinated
            </span>
          </div>

          <div className="border-t border-[#141414] pt-3">
            <span className="text-[10px] uppercase tracking-wider text-secondary block mb-1">
              Emergency Contact
            </span>
            <p className="text-sm text-white font-medium">+1 (859) 888-1260</p>
          </div>

          <button className="w-full bg-white text-black font-semibold text-sm h-11 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
            Report Found
          </button>
        </div>

      </div>
    </div>
  );
}
