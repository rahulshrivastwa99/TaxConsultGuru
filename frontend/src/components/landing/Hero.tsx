// src/components/landing/Hero.tsx
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Building2, 
  FileCheck, 
  ShieldCheck, 
  ClipboardCheck, 
  Scale, 
  TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroProps {
  onLearnMoreClick: () => void;
  onServiceClick: (service: string) => void;
}

const services = [
  {
    title: "Startup Registration",
    description: "TaxConsultGuru will assist in incorporating your company from basics till the end while providing startup recognition...",
    icon: Building2,
    iconColor: "text-amber-500",
  },
  {
    title: "Tax & Auditing",
    description: "Get your tax and auditing work done in a hassle-free manner with us. Professional GST and Income Tax return filing...",
    icon: FileCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "Compliance Management",
    description: "Elevate the environmental initiatives of your business and meet regulatory standards towards a sustainable future...",
    icon: ShieldCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "Advisory and Consultancy",
    description: "Our team of experts are dedicated to providing you with advisory and consultancy for any of your business-related requirements...",
    icon: TrendingUp,
    iconColor: "text-amber-500",
  },
  {
    title: "Regulatory Licensing",
    description: "We have a team of professionals who will guide you through the process of regulatory compliance, such as BIS, CDSCO, ISO, etc...",
    icon: ClipboardCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "On Demand CA/CS Services",
    description: "If you need the assistance of CA or CS for any of your business requirements, our professionals are there to provide business-centric guidance...",
    icon: Scale,
    iconColor: "text-amber-500",
  },
];

const SEARCH_PLACEHOLDERS = [
  "e.g. GST Registration",
  "e.g. Company Incorporation",
  "e.g. Trademark Filing",
  "e.g. ISO Certification",
  "e.g. Income Tax Return"
];

const Hero = ({ onLearnMoreClick, onServiceClick }: HeroProps) => {
  // Auto-typing effect state
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let ticker = setTimeout(() => {
      handleType();
    }, typingSpeed);
    return () => clearTimeout(ticker);
  }, [placeholderText, isDeleting, loopNum]);

  const handleType = () => {
    const i = loopNum % SEARCH_PLACEHOLDERS.length;
    const fullText = SEARCH_PLACEHOLDERS[i];

    setPlaceholderText(
      isDeleting 
        ? fullText.substring(0, placeholderText.length - 1) 
        : fullText.substring(0, placeholderText.length + 1)
    );

    if (!isDeleting && placeholderText === fullText) {
      setTimeout(() => setIsDeleting(true), 2000); // Pause at end of word
      setTypingSpeed(50); // Faster backspacing
    } else if (isDeleting && placeholderText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setTypingSpeed(100); // Normal typing speed
    }
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 min-h-[90vh] flex items-center overflow-hidden">
      {/* === BACKGROUND VIDEO LAYER === */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/Video_Generation_Request_Fulfilled.mp4" type="video/mp4" />
        </video>
        {/* Soft overlay to ensure readability while matching the clean white aesthetic */}
        <div className="absolute inset-0 bg-slate-50/70 md:bg-white/70 backdrop-blur-[1px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Text, Search & CTA (45%) */}
          <div className="lg:col-span-5 text-left animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] mb-6 leading-[1.15]">
              Premium Business Management Platform
            </h1>

            <p className="text-base text-slate-600 max-w-lg mb-8 leading-relaxed">
              At TaxConsultGuru, we are not just a platform; we are your partner who 
              guides you in the business world. As India's leading legal service provider, 
              we connect startups and enterprises with more than 10,000+ professionals.
            </p>

            {/* Auto-Typing Search Bar */}
            <div className="flex w-full max-w-md items-center space-x-2 border border-slate-200 bg-white rounded-xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 mb-8">
              <Input
                type="text"
                placeholder={`${placeholderText}|`}
                className="border-0 focus-visible:ring-0 shadow-none text-base bg-transparent font-medium placeholder:text-slate-400"
              />
              <Button
                onClick={() => onServiceClick("Search")}
                className="bg-[#0a2540] hover:bg-slate-800 text-white px-8 h-12 rounded-lg font-semibold transition-colors"
              >
                Search
              </Button>
            </div>

            {/* Popular Services Pills */}
            <div className="mb-10">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">
                Popular Services
              </p>
              <div className="flex flex-wrap gap-3">
                <span
                  onClick={() => onServiceClick("Company Registration")}
                  className="px-5 py-2 bg-white text-indigo-600 border border-indigo-100 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
                >
                  Company Registration
                </span>
                <span
                  onClick={() => onServiceClick("GST Registration")}
                  className="px-5 py-2 bg-white text-cyan-600 border border-cyan-100 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-cyan-50 hover:border-cyan-200 transition-all duration-300"
                >
                  GST Registration
                </span>
                <span
                  onClick={() => onServiceClick("ISO Registration")}
                  className="px-5 py-2 bg-white text-emerald-600 border border-emerald-100 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300"
                >
                  ISO Registration
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1"
                onClick={onLearnMoreClick}
              >
                Get Quotation <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-semibold border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
                onClick={() => onServiceClick("Explore")}
              >
                Explore Services
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Service Cards (55%) */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-white/50 backdrop-blur-sm border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-300 flex flex-col items-start"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <service.icon size={22} className={`${service.iconColor} group-hover:text-inherit stroke-[2.5px]`} />
                  </div>
                  <h3 className="text-[1.1rem] font-bold text-[#0a2540]">
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {service.description}
                </p>

                <button 
                  onClick={() => onServiceClick(service.title)}
                  className="mt-auto text-[#4f46e5] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all group/btn"
                >
                  read more
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;