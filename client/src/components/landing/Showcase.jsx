export default function Showcase() {
  return (
    <section id="how-it-works" className="bg-black text-white px-6 py-28 select-none font-body border-t border-[#141414]">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        
        {/* Section Heading */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">
            Recovery Flow
          </span>
          <h2 className="font-heading font-black text-3xl tracking-tighter">
            HOW IT WORKS
          </h2>
        </div>

        {/* 3 Stages list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Stage 1 */}
          <div className="flex flex-col gap-4 border-t border-[#262626] pt-6">
            <span className="font-mono text-xs text-secondary font-bold">01</span>
            <h3 className="font-heading font-black text-xl tracking-tight">Scan Tag</h3>
            <p className="text-secondary text-sm leading-relaxed">
              A finder scans the minimal QR tag on your pet's collar using any standard smartphone camera.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="flex flex-col gap-4 border-t border-[#262626] pt-6">
            <span className="font-mono text-xs text-secondary font-bold">02</span>
            <h3 className="font-heading font-black text-xl tracking-tight">View Profile</h3>
            <p className="text-secondary text-sm leading-relaxed">
              The public profile displays crucial health logs and emergency contacts, hiding private addresses.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="flex flex-col gap-4 border-t border-[#262626] pt-6">
            <span className="font-mono text-xs text-secondary font-bold">03</span>
            <h3 className="font-heading font-black text-xl tracking-tight">Return Home</h3>
            <p className="text-secondary text-sm leading-relaxed">
              You receive instant SMS alerts, coordinates, and contact details from the finder.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
