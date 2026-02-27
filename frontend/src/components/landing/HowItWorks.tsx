// src/components/landing/HowItWorks.tsx
import { FileText, CreditCard, Cog, Mail, ChevronsRight } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Submit Details",
    description:
      "Fill out a quick form detailing your specific business or tax requirement.",
    icon: FileText,
    bgClass: "bg-indigo-50",
    iconClass: "text-indigo-600",
    borderClass: "border-indigo-100 group-hover:border-indigo-300",
  },
  {
    id: "02",
    title: "Secure Payment",
    description:
      "Make a safe online payment. Funds are held securely until completion.",
    icon: CreditCard,
    bgClass: "bg-cyan-50",
    iconClass: "text-cyan-600",
    borderClass: "border-cyan-100 group-hover:border-cyan-300",
  },
  {
    id: "03",
    title: "Expert Processing",
    description:
      "Your assigned CA works on your application through our secure workspace.",
    icon: Cog,
    bgClass: "bg-amber-50",
    iconClass: "text-amber-500",
    borderClass: "border-amber-100 group-hover:border-amber-300",
  },
  {
    id: "04",
    title: "Project Delivery",
    description:
      "Receive your final documents and confirmation directly in your dashboard.",
    icon: Mail,
    bgClass: "bg-emerald-50",
    iconClass: "text-emerald-600",
    borderClass: "border-emerald-100 group-hover:border-emerald-300",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="process-section"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-step-0 { animation: float-soft 4s ease-in-out infinite 0s; }
        .animate-float-step-1 { animation: float-soft 4s ease-in-out infinite 1s; }
        .animate-float-step-2 { animation: float-soft 4s ease-in-out infinite 2s; }
        .animate-float-step-3 { animation: float-soft 4s ease-in-out infinite 3s; }

        @keyframes flow-slide {
          0%, 100% { transform: translateX(0) translateY(-50%); opacity: 0.4; }
          50% { transform: translateX(8px) translateY(-50%); opacity: 1; }
        }
        .animate-flow { animation: flow-slide 2s ease-in-out infinite; }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
              Working Process
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            We've streamlined the entire procedure. Follow these simple steps to
            get your legal and tax compliance sorted without the hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              // Added border-2 and step.borderClass for clear, themed boundaries
              className={`relative bg-white rounded-3xl p-8 border-2 ${step.borderClass} shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center animate-float-step-${index} group z-10`}
            >
              {/* Huge Background Number Watermark - Darkened so it's clearly visible */}
              <span className="absolute top-4 right-6 text-[5.5rem] font-black text-slate-100 opacity-80 pointer-events-none group-hover:text-slate-200 transition-colors duration-500">
                {step.id}
              </span>

              {/* Icon Circle */}
              <div
                className={`w-20 h-20 rounded-2xl ${step.bgClass} flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white`}
              >
                <step.icon
                  className={`w-9 h-9 ${step.iconClass} stroke-[2px]`}
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-extrabold text-slate-900 mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">
                {step.description}
              </p>

              {/* Desktop Connecting Arrow (Visible only on lg screens) */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-8 w-10 h-10 items-center justify-center text-slate-300 animate-flow z-0 pointer-events-none">
                  <ChevronsRight className="w-8 h-8 text-indigo-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
