// src/pages/AboutUs.tsx
import { Shield, Globe, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* --- MINIMAL NAVBAR (MATCHING IMAGE_D52981) --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group min-w-0"
            onClick={() => navigate("/")}
          >
            <img
              src="/Picsart_26-03-01_10-01-28-347.png"
              alt="TaxConsultGuru Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              TaxConsult<span className="text-indigo-600">Guru</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-sm">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                TaxConsultGuru
              </span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              India's premier managed marketplace designed to bridge the gap
              between businesses and top-tier financial expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Our Mission
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                To democratize professional financial services for startups and
                SMEs across India by providing a transparent, secure, and highly
                efficient platform to connect with verified experts.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Our Vision
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                To become the backbone of India's entrepreneurial ecosystem,
                ensuring that no business idea ever fails due to the
                complexities of legal or tax compliance.
              </p>
            </div>
          </div>

          <section className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Who We Are
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed font-medium">
              Born out of the need for speed and reliability in the professional
              services sector,
              <strong> TaxConsultGuru</strong> is more than just a platform—it
              is your partner in growth. We realized that entrepreneurs spend
              too much time navigating government portals and too little time
              building their products. We decided to change that.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Why Choose TCG?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Strict Verification for every CA/CS",
                "End-to-End Secure Workspaces",
                "Transparent, Flat-Fee Pricing",
                "Real-time Project Tracking",
                "Dedicated Admin Support Desk",
                "Quality Guaranteed Execution",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 font-bold text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* --- MINIMAL FOOTER (MATCHING IMAGE_D5297C) --- */}
      <footer className="bg-[#0a1120] py-12 text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-black tracking-tight text-white mb-4">
            TaxConsult<span className="text-indigo-400">Guru</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
