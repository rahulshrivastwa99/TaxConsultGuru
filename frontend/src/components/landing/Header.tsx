// src/components/landing/Header.tsx
import { useState } from "react";
import { Phone, Mail, Menu, X, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogoClick: () => void;
  onServicesClick: () => void;
  onExpertsClick: () => void;
  onLoginClick: () => void;
  onGetStartedClick: () => void;
}

const Header = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogoClick,
  onServicesClick,
  onExpertsClick,
  onLoginClick,
  onGetStartedClick,
}: HeaderProps) => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 py-4 px-2 sm:px-6 mt-2">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl rounded-2xl h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between">
          {/* Logo - Added min-w-0 to allow child text to truncate if needed on tiny screens */}
          <div
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group min-w-0 mr-2"
            onClick={onLogoClick}
          >
            <img
              src="/Picsart_26-03-01_10-01-28-347.png"
              alt="TaxConsultGuru Logo"
              className="w-12 h-12 object-contain"
            />

            {/* Added truncate so it doesn't push the menu out on very small mobiles */}
            <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              TaxConsult<span className="text-indigo-600">Guru</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            <button
              onClick={onServicesClick}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all hover:-translate-y-0.5"
            >
              Services
            </button>
            <button
              onClick={onExpertsClick}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all hover:-translate-y-0.5"
            >
              For Experts
            </button>
          </nav>

          {/* Contacts & Actions - Changed gap-4 to gap-2 for mobile to save space */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Contact Pill with Dropdown */}
            <div
              className="hidden lg:block relative"
              onMouseEnter={() => setIsContactOpen(true)}
              onMouseLeave={() => setIsContactOpen(false)}
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full cursor-pointer hover:bg-white hover:shadow-md transition-all duration-300">
                <Phone size={16} className="text-slate-500" />
                <Mail size={16} className="text-slate-500" />
                <img
                  src="/Picsart_26-02-26_20-21-22-387.png"
                  alt="WhatsApp"
                  className="w-4 h-4 object-contain brightness-0 opacity-50"
                  style={{
                    filter:
                      "invert(16%) sepia(89%) saturate(6054%) hue-rotate(152deg) brightness(96%) contrast(101%)",
                  }}
                />
              </div>

              {/* Mega Dropdown */}
              {isContactOpen && (
                <div className="absolute top-full right-0 pt-4 w-[540px] animate-in fade-in zoom-in-95 duration-200 z-[60]">
                  <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* Call Column */}
                      <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover/item:bg-orange-600 group-hover/item:text-white transition-colors">
                          <Phone size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                          Call
                        </h4>
                        <p className="text-[10px] text-slate-500 mb-4 leading-tight">
                          Connect with us for legal assistance
                        </p>
                        <a
                          href="tel:+919113311333"
                          className="text-[11px] font-black text-indigo-600 flex items-center gap-1"
                        >
                          +91-9315871626 <ArrowRight size={12} />
                        </a>
                      </div>

                      {/* Email Column */}
                      <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                          <Mail size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                          Email
                        </h4>
                        <p className="text-[10px] text-slate-500 mb-4 leading-tight">
                          Need help? Drop us an email
                        </p>
                        <a
                          href="mailto:help@taxconsultguru.com"
                          className="text-[11px] font-black text-indigo-600 flex items-center gap-1"
                        >
                          Email Us <ArrowRight size={12} />
                        </a>
                      </div>

                      {/* WhatsApp Column */}
                      <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                          <MessageSquare size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                          Whatsapp
                        </h4>
                        <p className="text-[10px] text-slate-500 mb-4 leading-tight">
                          Need a quick help? Leave us a message
                        </p>
                        <a
                          href="https://wa.me/9315871626"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-black text-indigo-600 flex items-center gap-1"
                        >
                          Text Us <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all hidden sm:flex"
            >
              Login
            </Button>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 rounded-lg sm:rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-24 left-6 right-6 bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <button
              onClick={onServicesClick}
              className="flex items-center justify-between font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl group"
            >
              Services
              <ArrowRight size={18} className="text-indigo-600" />
            </button>
            <button
              onClick={onExpertsClick}
              className="flex items-center justify-between font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl group"
            >
              For Experts
              <ArrowRight size={18} className="text-indigo-600" />
            </button>
            <div className="h-px bg-slate-100 my-2" />
            <Button
              onClick={onLoginClick}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20"
            >
              Login
            </Button>
            <div className="flex items-center justify-around pt-6 border-t border-slate-50">
              <Phone className="w-6 h-6 text-slate-400" />
              <Mail className="w-6 h-6 text-slate-400" />
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
