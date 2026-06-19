import { Link } from 'react-router-dom';

export default function MissingSection() {
  return (
    <section className="bg-black text-white px-6 py-28 select-none font-body border-t border-[#141414]">
      <div className="max-w-4xl mx-auto text-center flex flex-col gap-10">
        
        {/* HUGE TYPOGRAPHY */}
        <h2 className="font-heading font-[900] text-neutral-800 text-[clamp(4.5rem,12vw,10rem)] leading-[0.8] tracking-[-0.05em]">
          MISSING
        </h2>

        <div className="flex flex-col items-center gap-2">
          <h3 className="font-heading font-black text-3xl tracking-tight">BRUNO</h3>
          <p className="text-secondary text-sm font-medium">
            Golden Retriever &middot; Missing Since 18 Jun 2026 &middot; Reward ₹5,000
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Link 
            to="/pet/bruno" 
            className="bg-white text-black font-semibold h-11 px-8 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors"
          >
            REPORT FOUND
          </Link>
          <p className="text-secondary text-xs max-w-sm leading-relaxed mt-2">
            They are not just pets. They are family. A single scan can bring them home.
          </p>
        </div>

      </div>
    </section>
  );
}
