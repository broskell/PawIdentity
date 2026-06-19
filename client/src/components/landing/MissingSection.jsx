import { Link } from 'react-router-dom';

export default function MissingSection() {
  return (
    <section className="bg-black text-white py-32 border-t border-[#141414] select-none font-body w-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center gap-12 text-center px-6">
        
        {/* HUGE MISSING */}
        <h2 className="font-heading font-[900] text-white text-[clamp(5rem,15vw,12rem)] leading-[0.8] tracking-[-0.05em] uppercase">
          MISSING
        </h2>

        {/* Pet details */}
        <div className="flex flex-col gap-3 items-center">
          <h3 className="font-heading font-black text-4xl tracking-tighter">Bruno</h3>
          <p className="text-secondary text-base font-mono">
            Golden Retriever
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm font-mono text-secondary mt-2">
            <span>Missing Since: 18 Jun 2026</span>
            <span>Reward: ₹5000</span>
          </div>
        </div>

        {/* Button */}
        <div>
          <Link 
            to="/pet/bruno" 
            className="bg-white text-black font-black text-sm uppercase tracking-wider h-12 px-10 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors"
          >
            REPORT FOUND
          </Link>
        </div>

        {/* Footer text */}
        <div className="border-t border-[#262626] pt-8 mt-4 max-w-lg w-full">
          <p className="text-secondary text-sm leading-relaxed">
            They are not just pets. They are family.<br />
            <span className="text-white font-medium">A single scan can bring them home.</span>
          </p>
        </div>

      </div>
    </section>
  );
}
