'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Menu, 
  X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Slow float animation for the anodized aluminum tag
  const tagFloatVariants = {
    animate: {
      y: [0, -6, 0],
      rotate: [0, 1, 0],
      transition: {
        duration: 7,
        ease: "easeInOut" as const,
        repeat: Infinity,
      }
    }
  };

  // Apple Wallet profile card slide-up
  const walletCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-[#141414] h-[72px]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              {/* Square Logo */}
              <div className="w-8 h-8 rounded border border-[#262626] bg-[#0d0d0d] flex items-center justify-center font-mono font-bold text-base tracking-tight text-white select-none">
                P
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-12 text-[15px] font-medium">
              <a href="#how-it-works" className="text-[#9a9a9a] hover:text-white transition-colors duration-200">How It Works</a>
              <a href="#features" className="text-[#9a9a9a] hover:text-white transition-colors duration-200">Features</a>
              <a href="#showcase" className="text-[#9a9a9a] hover:text-white transition-colors duration-200">Showcase</a>
              <Link href="/lost" className="text-[#9a9a9a] hover:text-white transition-colors duration-200">
                Lost & Found
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/auth" className="text-[15px] font-medium text-[#9a9a9a] hover:text-white transition-colors duration-200">
              Log In
            </Link>
            <Link href="/auth" className="h-10 px-6 bg-white text-black text-[14px] font-semibold rounded-full hover-lift flex items-center justify-center">
              Register Pet
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-[#9a9a9a] hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-black border-t border-[#141414] flex flex-col p-6 gap-6 md:hidden animate-fade-in">
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#141414] pb-3 text-[#9a9a9a] hover:text-white"
          >
            How It Works
          </a>
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#141414] pb-3 text-[#9a9a9a] hover:text-white"
          >
            Features
          </a>
          <a 
            href="#showcase" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#141414] pb-3 text-[#9a9a9a] hover:text-white"
          >
            Showcase
          </a>
          <Link 
            href="/lost" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#141414] pb-3 text-[#9a9a9a] hover:text-white"
          >
            Lost & Found
          </Link>
          <div className="flex flex-col gap-3 mt-auto">
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 border border-[#262626] rounded-full text-center text-sm font-medium text-[#9a9a9a] hover:text-white">
              Log In
            </Link>
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-white text-black rounded-full text-center text-sm font-semibold hover-lift">
              Register Pet
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          
          <h1 className="text-[clamp(4rem,11.5vw,9.5rem)] font-satoshi font-black tracking-[-0.1em] leading-[0.85] text-white select-none max-w-5xl mx-auto">
            One Scan Away<br />From Home.
          </h1>

          <p className="text-lg md:text-xl text-[#9a9a9a] font-sans max-w-xl mx-auto mt-8 mb-10 leading-relaxed font-normal">
            A secure identity, medical history, and a way back home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link href="/auth" className="w-full sm:w-auto h-[52px] px-[28px] bg-white text-black font-semibold rounded-full hover-lift flex items-center justify-center">
              Register Pet
            </Link>
            <Link href="/lost" className="w-full sm:w-auto h-[52px] px-[28px] border border-white text-white font-semibold rounded-full hover-lift flex items-center justify-center">
              Scan QR
            </Link>
          </div>

          {/* Tag & Wallet Card Overlapping Showcase */}
          <div className="relative w-full max-w-lg mx-auto flex items-center justify-center h-[540px]">
            {/* Soft Radial Glow behind tag only */}
            <div className="soft-glow absolute w-[360px] h-[360px] rounded-full z-0 translate-x-[60px] -translate-y-[40px]" />
            
            {/* Apple Wallet Card Preview (+15% width, +10% height, pushed lower) */}
            <motion.div
              variants={walletCardVariants}
              initial="hidden"
              animate="visible"
              className="z-10 absolute left-[2%] bottom-0 w-[320px] sm:w-[368px] h-[460px] sm:h-[500px] bg-black border border-[#262626] rounded-[28px] p-8 text-left shadow-2xl flex flex-col justify-between"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-[#0d0d0d] mb-5 relative border border-[#262626]">
                    <img 
                      src="/bruno.png" 
                      alt="Bruno Portrait" 
                      className="w-full h-full object-cover grayscale scale-[1.05]"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-satoshi font-bold tracking-tight text-white leading-tight">Bruno</h4>
                      <p className="text-xs text-[#9a9a9a] font-sans mt-0.5">Golden Retriever</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full border border-[#262626] bg-[#0d0d0d] text-[10px] font-mono text-white flex items-center gap-1 select-none">
                      Vaccinated ✓
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#262626] flex flex-col gap-3">
                  <div>
                    <span className="text-[9px] font-mono text-[#9a9a9a] uppercase tracking-wider block">Emergency Contact</span>
                    <span className="text-xs font-mono text-white font-medium">+91 90302 17599</span>
                  </div>
                  <button className="w-full mt-1 py-3 bg-white text-black font-semibold rounded-full text-xs hover-lift flex items-center justify-center">
                    Report Found
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Matte Black Anodized Aluminum QR Tag (Increased vertical padding & spacing) */}
            <motion.div
              variants={tagFloatVariants}
              animate="animate"
              className="z-20 absolute right-[5%] top-2 w-[170px] sm:w-[190px] h-[280px] sm:h-[310px] bg-[#080808] border border-[#262626] rounded-[24px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),_0_16px_36px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between py-8 px-6"
            >
              {/* Screw Hole / Black Ring */}
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#262626] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#030303]" />
              </div>

              {/* Laser Engraved Typography */}
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-[8px] font-mono tracking-[0.25em] text-[#9a9a9a] uppercase select-none">PAWPASS</span>
                <span className="text-lg font-satoshi font-bold tracking-tight text-white select-none">BRUNO</span>
              </div>

              {/* Minimal SVG QR Code */}
              <div className="w-16 h-16 bg-white p-1 rounded-sm flex items-center justify-center shadow-md select-none">
                <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="80" y="10" width="10" height="10" fill="white" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="10" y="80" width="10" height="10" fill="white" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="70" y="70" width="10" height="10" />
                  <rect x="90" y="90" width="10" height="10" />
                  <rect x="50" y="10" width="10" height="20" />
                  <rect x="10" y="50" width="20" height="10" />
                  <rect x="80" y="50" width="10" height="10" />
                </svg>
              </div>

              {/* Engraved Small Typography */}
              <div className="flex flex-col items-center text-center gap-0.5">
                <span className="text-[7px] font-mono tracking-widest text-[#9a9a9a] select-none">SCAN TO IDENTIFY</span>
                <span className="text-[9px] font-mono text-white select-none">PP-2026-001</span>
                <span className="text-[8px] font-mono text-[#9a9a9a] tracking-tight italic select-none mt-1">Lost & Loved</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section id="showcase" className="py-28 md:py-40 border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 items-center">
            
            {/* Stage 01 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
              {/* Opacity increased from 0.08 to 0.15 */}
              <span className="text-[64px] md:text-[80px] font-mono font-bold leading-none text-white/15 select-none">01</span>
              <h3 className="text-2xl font-satoshi font-bold tracking-tight text-white">Scan Tag</h3>
              
              {/* Muji-style larger, cleaner geometric packaging display */}
              <div className="w-[140px] h-[200px] bg-[#0c0c0c] border border-[#262626] rounded-xl flex flex-col items-center justify-between p-6 my-4 select-none">
                <div className="w-2 h-2 rounded-full bg-black border border-[#262626]" />
                <div className="w-14 h-14 bg-white p-1 rounded-sm">
                  {/* Large geometric clean QR */}
                  <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="35" height="35" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="65" y="0" width="35" height="35" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="0" y="65" width="35" height="35" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="45" y="45" width="20" height="20" />
                  </svg>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-[#9a9a9a]">PAWPASS</span>
              </div>
              <span className="text-xs text-[#9a9a9a] uppercase tracking-wider select-none font-mono">Scan →</span>
            </div>

            {/* Stage 02 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
              <span className="text-[64px] md:text-[80px] font-mono font-bold leading-none text-white/15 select-none">02</span>
              <h3 className="text-2xl font-satoshi font-bold tracking-tight text-white">View Identity</h3>
              <div className="w-[180px] bg-[#0c0c0c] border border-[#262626] rounded-xl p-5 my-4 text-left select-none">
                <div className="h-1.5 w-8 bg-white/20 rounded mb-2" />
                <div className="h-2 w-16 bg-white rounded mb-4" />
                <div className="h-1 w-24 bg-white/10 rounded mb-1" />
                <div className="h-1 w-20 bg-white/10 rounded" />
              </div>
              <span className="text-xs text-[#9a9a9a] uppercase tracking-wider select-none font-mono">Know →</span>
            </div>

            {/* Stage 03 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
              <span className="text-[64px] md:text-[80px] font-mono font-bold leading-none text-white/15 select-none">03</span>
              <h3 className="text-2xl font-satoshi font-bold tracking-tight text-white">Return Home</h3>
              <div className="w-[180px] bg-[#0c0c0c] border border-[#262626] rounded-xl p-5 my-4 flex items-center justify-between select-none">
                <div>
                  <div className="text-[7px] font-mono text-[#9a9a9a] tracking-wider uppercase">Owner Notified</div>
                  <div className="text-[9px] font-mono text-white mt-0.5">LOCATION LOGGED</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              </div>
              <span className="text-xs text-[#9a9a9a] uppercase tracking-wider select-none font-mono">Return Home.</span>
            </div>

          </div>
        </div>
      </section>

      {/* WHY PAWPASS EXISTS (Increased line height & max width) */}
      <section className="py-32 md:py-48 border-b border-[#141414]">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl text-[#9a9a9a] font-sans leading-[1.4] tracking-tight select-none">
            Every year, <span className="text-white font-medium">thousands of pets go missing</span>. Most collars only contain a phone number. PawPass gives every pet <span className="text-white font-medium">a secure identity</span>, medical history, and a way back home.
          </p>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section id="how-it-works" className="py-28 md:py-40 border-b border-[#141414]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-12">
          
          {[
            { step: '01', title: 'Register Pet', desc: 'Input details, medical history, vaccinations, and emergency contacts.' },
            { step: '02', title: 'Generate QR', desc: 'Our system creates a secure profile linked to a physical tag slug.' },
            { step: '03', title: 'Attach Tag', desc: 'Secure the anodized aluminum smart tag to your pet\'s collar.' }
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col md:flex-row md:items-baseline justify-between py-6 gap-6 md:gap-12 group">
                <div className="flex items-baseline gap-6 md:gap-12">
                  <span className="font-mono text-[#9a9a9a] text-sm font-semibold select-none">{item.step}</span>
                  <h3 className="text-2xl md:text-3xl font-satoshi font-bold text-white transition-colors duration-300 group-hover:text-white">{item.title}</h3>
                </div>
                <p className="text-sm md:text-base text-[#9a9a9a] max-w-md leading-relaxed">{item.desc}</p>
              </div>
              {/* Separators thinned to border-white/5 */}
              {idx < 2 && <div className="border-t border-white/5 w-full" />}
            </React.Fragment>
          ))}

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-28 md:py-40 border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mb-24">
            <h2 className="text-[clamp(3.5rem,7vw,7rem)] font-satoshi font-black tracking-[-0.08em] leading-[0.9] text-white select-none">
              Everything they need<br />in a single tag.
            </h2>
          </div>

          {/* Asymmetrical Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Card 1: Wide - QR Identity (No paragraphs, show visual QR & label) */}
            <div className="md:col-span-8 bg-[#0c0c0c] border border-[#262626] rounded-[28px] p-9 min-h-[300px] flex flex-col justify-between hover:border-[#3a3a3a] transition-all duration-300">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className="text-2xl font-satoshi font-bold text-white tracking-tight mb-2">QR Identity</h3>
                  <span className="text-[9px] font-mono tracking-widest text-[#9a9a9a] uppercase select-none">PAWPASS // IDENTITY SECURED</span>
                </div>
                {/* Large geometric QR code */}
                <div className="w-20 h-20 bg-white p-1 rounded-sm flex items-center justify-center shadow-lg select-none">
                  <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="10" y="10" width="10" height="10" fill="white" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="80" y="10" width="10" height="10" fill="white" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="10" y="80" width="10" height="10" fill="white" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="70" y="70" width="10" height="10" />
                    <rect x="90" y="90" width="10" height="10" />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flex justify-center py-4 bg-black border border-white/5 rounded-2xl select-none">
                <span className="text-[10px] font-mono tracking-widest text-[#9a9a9a] uppercase">PAWPASS IDENTITY SYSTEM</span>
              </div>
            </div>

            {/* Card 2: Medium - Medical Timeline (Apple Health style vertical timeline, no copy blocks) */}
            <div className="md:col-span-4 bg-[#0c0c0c] border border-[#262626] rounded-[28px] p-9 min-h-[300px] flex flex-col justify-between hover:border-[#3a3a3a] transition-all duration-300">
              <div>
                <h3 className="text-2xl font-satoshi font-bold text-white tracking-tight mb-4">Medical Timeline</h3>
              </div>
              {/* Apple Health style timeline details */}
              <div className="flex flex-col gap-5 border-l border-white/10 pl-4 relative select-none text-left py-2">
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
                  <span className="text-[10px] font-mono text-[#9a9a9a] block">18 JUN 2026</span>
                  <span className="text-xs font-semibold text-white">Rabies Vaccine</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-black" />
                  <span className="text-[10px] font-mono text-[#9a9a9a] block">05 AUG 2026</span>
                  <span className="text-xs font-semibold text-white/50">Deworming</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-black" />
                  <span className="text-[10px] font-mono text-[#9a9a9a] block">24 OCT 2026</span>
                  <span className="text-xs font-semibold text-white/50">Annual Checkup</span>
                </div>
              </div>
            </div>

            {/* Card 3: Medium - Lost & Found Recovery (Giant LOST watermark with opacity 0.08 & Bruno info) */}
            <div className="md:col-span-4 bg-[#0c0c0c] border border-[#262626] rounded-[28px] p-9 min-h-[340px] flex flex-col justify-between hover:border-[#3a3a3a] transition-all duration-300 overflow-hidden relative">
              <div className="z-10">
                <h3 className="text-2xl font-satoshi font-bold text-white tracking-tight mb-2">Lost & Found</h3>
              </div>
              
              {/* Giant watermark text (0.08 opacity) */}
              <div className="absolute inset-0 flex items-center justify-center select-none z-0">
                <span className="text-[100px] font-satoshi font-black tracking-tighter text-white/10 uppercase leading-none">LOST</span>
              </div>

              {/* Foreground details */}
              <div className="mt-auto z-10 font-mono text-left space-y-2">
                <div>
                  <span className="text-[9px] text-[#9a9a9a] uppercase tracking-wider block">Target Pet</span>
                  <span className="text-xs text-white font-medium">Bruno</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#9a9a9a] uppercase tracking-wider block">Status</span>
                  <span className="text-xs text-white font-medium">Missing Since 18 Jun</span>
                </div>
              </div>
            </div>

            {/* Card 4: Wide - Dose Reminders (Massive 18 JUN, Rabies Due below, no paragraphs) */}
            <div className="md:col-span-8 bg-[#0c0c0c] border border-[#262626] rounded-[28px] p-9 min-h-[340px] flex flex-col justify-between hover:border-[#3a3a3a] transition-all duration-300">
              <div>
                <h3 className="text-2xl font-satoshi font-bold text-white tracking-tight mb-2">Dose Reminders</h3>
              </div>
              {/* Massive date text and label below */}
              <div className="mt-auto flex flex-col items-start gap-1 select-none text-left">
                <div className="text-[64px] md:text-[80px] font-mono font-bold leading-none text-white tracking-tighter">
                  18 JUN
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#9a9a9a] mt-1 pl-1">
                  Rabies Due
                </div>
              </div>
            </div>

            {/* Card 5: Centered Full - Emergency Contacts (Phone card, no paragraphs) */}
            <div className="md:col-span-12 bg-[#0c0c0c] border border-[#262626] rounded-[28px] p-9 min-h-[260px] flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-[#3a3a3a] transition-all duration-300 gap-8">
              <div className="max-w-md text-left">
                <h3 className="text-2xl font-satoshi font-bold text-white tracking-tight mb-2">Emergency Contacts</h3>
                <span className="text-[10px] font-mono text-[#9a9a9a] tracking-wider uppercase">SECURE PROXY CONNECTION</span>
              </div>
              {/* Clean phone contact card layout */}
              <div className="border border-[#262626] bg-black rounded-2xl p-6 w-full sm:w-[260px] flex flex-col gap-2 font-mono text-xs select-none text-left">
                <div className="text-[9px] text-[#9a9a9a] uppercase">Primary Owner</div>
                <div className="text-white font-medium">+91 90302 17599</div>
                <div className="h-px bg-[#141414] my-1" />
                <div className="text-[9px] text-[#9a9a9a] uppercase">Backup Route</div>
                <div className="text-white font-medium">relay.pawpass.id/bruno</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MISSING SECTION (Emotional Climax - BRUNO font increased 20%) */}
      <section className="min-h-screen bg-[#050505] flex flex-col justify-center items-center py-20 relative select-none">
        
        {/* Background Giant Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden pointer-events-none">
          <span className="text-[20vw] font-satoshi font-black tracking-tighter text-white/5 uppercase select-none leading-none">
            MISSING
          </span>
        </div>

        {/* Foreground Content */}
        <div className="z-10 text-center flex flex-col items-center max-w-4xl px-6">
          {/* Increased size by 20% */}
          <h2 className="text-[clamp(5.5rem,14.5vw,12rem)] font-satoshi font-black tracking-[-0.1em] leading-none text-white select-none">
            BRUNO
          </h2>
          <p className="text-xl text-[#9a9a9a] font-sans mt-4">Golden Retriever</p>

          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 mt-16 font-mono">
            <div className="text-center">
              <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider block">Missing Since</span>
              <span className="text-lg text-white mt-1 block">18 Jun 2026</span>
            </div>
            <div className="h-px w-8 bg-[#262626] sm:h-8 sm:w-px" />
            <div className="text-center">
              <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider block">Reward</span>
              <span className="text-lg text-white mt-1 block">₹5000</span>
            </div>
          </div>

          {/* Premium styled Report Found button */}
          <button className="mt-16 h-[52px] px-[28px] border border-white/20 text-white font-semibold rounded-full bg-transparent hover:bg-white hover:text-black transition-all duration-300 hover-lift flex items-center justify-center">
            REPORT FOUND
          </button>

          <div className="mt-28 max-w-md text-center">
            <p className="text-sm text-[#9a9a9a] font-sans leading-relaxed">
              They are not just pets. They are family.<br />
              A single scan can bring them home.
            </p>
          </div>
        </div>

      </section>

      {/* FOOTER (Brand signature on left, copyright on right) */}
      <footer className="bg-black border-t border-[#141414] py-16 text-center text-[#9a9a9a] text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded border border-[#262626] bg-[#0d0d0d] flex items-center justify-center font-mono font-bold text-xs select-none">
                P
              </div>
              <span className="font-bold tracking-tight text-white select-none">PAWPASS</span>
            </div>
            <span className="font-mono text-[10px] text-white/50 tracking-wider">Lost & Loved.</span>
          </div>

          <div className="flex items-center gap-8 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#showcase" className="hover:text-white transition-colors duration-200">Showcase</a>
            <Link href="/lost" className="hover:text-white transition-colors duration-200">Lost & Found</Link>
          </div>

          <span className="select-none font-mono text-[10px] text-right">© 2026 PawPass. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
