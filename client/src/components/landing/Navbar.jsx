import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-[72px] bg-black border-b border-[#141414] px-6 lg:px-12 flex items-center justify-between font-body select-none">
      {/* Left Logo */}
      <Link 
        to="/" 
        className="font-heading font-black tracking-tighter text-white text-xl"
      >
        PAWIDENTITY
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8 text-[14px] text-secondary font-medium">
        <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
          How It Works
        </a>
        <a href="#features" className="hover:text-white transition-colors duration-200">
          Features
        </a>
        <Link to="/lost" className="hover:text-white transition-colors duration-200">
          Lost & Found
        </Link>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-6">
        <Link 
          to="/auth?mode=login" 
          className="text-[14px] text-secondary hover:text-white font-medium transition-colors duration-200"
        >
          Login
        </Link>
        <Link 
          to="/auth?mode=register" 
          className="bg-white text-black font-semibold text-[14px] px-6 py-2.5 rounded-full hover:bg-neutral-200 transition-colors duration-200"
        >
          Register Pet
        </Link>
      </div>
    </nav>
  );
}
