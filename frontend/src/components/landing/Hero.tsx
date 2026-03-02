// src/components/landing/Hero.tsx
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Building2,
  FileCheck,
  ShieldCheck,
  ClipboardCheck,
  Scale,
  TrendingUp,
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
    description:
      "TaxConsultGuru will assist in incorporating your company from basics till the end while providing startup recognition...",
    icon: Building2,
    iconColor: "text-amber-500",
  },
  {
    title: "Tax & Auditing",
    description:
      "Get your tax and auditing work done in a hassle-free manner with us. Professional GST and Income Tax return filing...",
    icon: FileCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "Compliance Management",
    description:
      "Elevate the environmental initiatives of your business and meet regulatory standards towards a sustainable future...",
    icon: ShieldCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "Advisory and Consultancy",
    description:
      "Our team of experts are dedicated to providing you with advisory and consultancy for any of your business-related requirements...",
    icon: TrendingUp,
    iconColor: "text-amber-500",
  },
  {
    title: "Regulatory Licensing",
    description:
      "We have a team of professionals who will guide you through the process of regulatory compliance, such as BIS, CDSCO, ISO, etc...",
    icon: ClipboardCheck,
    iconColor: "text-amber-500",
  },
  {
    title: "On Demand CA/CS Services",
    description:
      "If you need the assistance of CA or CS for any of your business requirements, our professionals are there to provide business-centric guidance...",
    icon: Scale,
    iconColor: "text-amber-500",
  },
];

const SEARCH_PLACEHOLDERS = [
  "e.g. GST Registration",
  "e.g. Company Incorporation",
  "e.g. Trademark Filing",
  "e.g. ISO Certification",
  "e.g. Income Tax Return",
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
        : fullText.substring(0, placeholderText.length + 1),
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
    <>
      {/* === TOP SECTION: HERO VIDEO & TEXT (RIGHT SIDE EMPTY) === */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 min-h-[90vh] flex items-center overflow-hidden">
        {/* BACKGROUND VIDEO LAYER */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source
              src="/Video_Generation_Request_Fulfilled.mp4"
              type="video/mp4"
            />
          </video>
          {/* Soft overlay to ensure readability while matching the clean white aesthetic */}
          <div className="absolute inset-0 bg-slate-50/70 md:bg-white/70 backdrop-blur-[1px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text, Search & CTA */}
            <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] mb-6 leading-[1.15]">
                Premium Business Management Platform
              </h1>

              <p className="text-base text-slate-600 max-w-lg mb-8 leading-relaxed">
                More than just a platform, TaxConsultGuru is your dedicated
                growth partner. We simplify compliance by connecting India’s
                startups and enterprises with a carefully curated network of
                verified tax and legal experts.
              </p>

              {/* Auto-Typing Search Bar */}
              <div className="flex w-full max-w-md items-center space-x-2 border border-slate-200 bg-white rounded-xl p-1 sm:p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 mb-8">
                <Input
                  type="text"
                  placeholder={`${placeholderText}|`}
                  className="border-0 focus-visible:ring-0 shadow-none text-sm sm:text-base bg-transparent font-medium placeholder:text-slate-400"
                />
                <Button
                  onClick={() => onServiceClick("Search")}
                  className="bg-[#0a2540] hover:bg-slate-800 text-white px-4 sm:px-8 h-10 sm:h-12 rounded-lg font-semibold transition-colors text-sm sm:text-base"
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

            {/* Right Column: Emptied to reveal video clearly */}
            <div className="relative hidden lg:flex h-full min-h-[550px] w-full items-center justify-center">
              {/* No boxes here anymore! */}
            </div>
          </div>
        </div>
      </section>

      {/* === BOTTOM SECTION: THE 6 SERVICE BOXES === */}
      <section className="py-20 bg-slate-50 border-b border-slate-200 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => onServiceClick(service.title)}
                className="group bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300`}
                  >
                    <service.icon
                      size={26}
                      className={`${service.iconColor} stroke-[2px] group-hover:text-indigo-600 transition-colors`}
                    />
                  </div>
                  <h3 className="text-[1.1rem] font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">
                    {service.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 font-medium line-clamp-3">
                  {service.description}
                </p>

                <div className="mt-auto text-indigo-600 text-sm font-bold flex items-center gap-1.5 group-hover:text-indigo-800 transition-colors">
                  read more
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1.5 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
