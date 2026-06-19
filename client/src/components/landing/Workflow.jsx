export default function Workflow() {
  const steps = [
    { num: '01', title: 'Register Pet', desc: 'Create a secure digital profile for your pet with their breed, weight, medical history, and emergency contacts.' },
    { num: '02', title: 'Generate QR', desc: 'Our platform automatically generates a custom, secure QR smart code linked directly to your pet\'s public profile.' },
    { num: '03', title: 'Attach Tag', desc: 'Print the QR code or engrave it onto a physical tag, then attach it securely to your pet\'s collar.' },
    { num: '04', title: 'Scan Tag', desc: 'If your pet goes missing, any finder can scan the QR code to view crucial health data and report them found.' },
    { num: '05', title: 'Return Home', desc: 'You receive instant SMS alerts and scan details. Reconnect and bring them back home safely.' }
  ];

  return (
    <section id="how-it-works" className="bg-black text-white px-6 py-32 select-none font-body border-t border-[#141414]">
      <div className="max-w-xl mx-auto flex flex-col gap-16">
        
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">
            The Process
          </span>
          <h2 className="font-heading font-black text-3xl tracking-tighter">
            HOW IT WORKS
          </h2>
        </div>

        {/* Vertical Steps */}
        <div className="flex flex-col">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Step Row */}
              <div className="py-12 flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
                <span className="font-mono text-5xl font-black text-neutral-800 select-none">
                  {step.num}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading font-bold text-xl text-white">
                    {step.title}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>
              
              {/* Divider (except last step) */}
              {idx < steps.length - 1 && (
                <div className="h-[1px] bg-border w-full"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
