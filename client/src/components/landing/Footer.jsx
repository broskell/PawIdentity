import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#141414] py-12 px-6 lg:px-12 font-body text-secondary text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left branding */}
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <span className="font-heading font-black text-white tracking-tighter">
            PAWIDENTITY
          </span>
          <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-widest">
            Lost & Loved
          </span>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors duration-200">
            Features
          </a>
          <Link to="/lost" className="hover:text-white transition-colors duration-200">
            Lost & Found
          </Link>
          <a href="#support" className="hover:text-white transition-colors duration-200">
            Support
          </a>
        </div>

        {/* Right copyright */}
        <div className="text-[12px] text-neutral-600 font-mono">
          &copy; {new Date().getFullYear()} PawIdentity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
