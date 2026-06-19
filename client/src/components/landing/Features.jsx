export default function Features() {
  const list = [
    {
      title: 'QR Identity',
      desc: 'Unique tag ID linking to a secure, modern digital recovery profile.'
    },
    {
      title: 'Medical Timeline',
      desc: 'Track vet records, surgeries, prescriptions, and conditions in one place.'
    },
    {
      title: 'Vaccination Alerts',
      desc: 'Automatic record-keeping and renewal indicators for critical immunization.'
    },
    {
      title: 'Lost & Found Feed',
      desc: 'Active registry of missing pets, helping local shelters and finders reconnect.'
    },
    {
      title: 'Emergency Contacts',
      desc: 'Display specific recovery phone numbers to finders instantly.'
    },
    {
      title: 'Scan History logs',
      desc: 'Real-time telemetry showing date, browser, and geographic location maps.'
    }
  ];

  return (
    <section id="features" className="bg-black text-white px-6 py-28 select-none font-body border-t border-[#141414]">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">
            Capabilities
          </span>
          <h2 className="font-heading font-black text-3xl tracking-tighter">
            FEATURES
          </h2>
        </div>

        {/* CSS Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {list.map((item, idx) => (
            <div 
              key={idx}
              className="bg-surface border border-border rounded-[20px] p-6 flex flex-col gap-3"
            >
              <h3 className="font-heading font-bold text-lg text-white">
                {item.title}
              </h3>
              <p className="text-secondary text-xs leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
