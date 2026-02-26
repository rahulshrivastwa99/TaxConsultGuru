// src/components/landing/HowItWorks.tsx
import { FileText, CreditCard, Cog, Mail } from "lucide-react";

const steps = [
  {
    title: "Fill Up Application Form",
    icon: FileText,
    bgColor: "bg-indigo-600",
  },
  {
    title: "Make Online Payment",
    icon: CreditCard,
    bgColor: "bg-slate-900",
  },
  {
    title: "Executive will process Application",
    icon: Cog,
    bgColor: "bg-indigo-600",
  },
  {
    title: "Get Confirmation on Mail",
    icon: Mail,
    bgColor: "bg-slate-900",
  },
];

const HowItWorks = () => {
  return (
    <section id="process-section" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Our Working Process
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 overflow-hidden rounded-2xl shadow-lg">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${step.bgColor} p-10 flex flex-col items-center text-center transition-transform hover:scale-[1.02] duration-300 relative z-10`}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-white">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {step.title}
              </h3>
              
              {/* Optional: Step Number Indicator */}
              <span className="absolute top-4 right-4 text-white/10 text-6xl font-black select-none z-0">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
