import { Shield, Users, Target, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
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
              TCG – TaxConsultGuru is a professionally managed consulting
              platform dedicated to delivering comprehensive taxation,
              compliance, and corporate advisory solutions across India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Who We Are
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                Established with a vision to simplify regulatory complexities
                for businesses, TCG brings together a network of qualified
                professionals including Chartered Accountants, Company
                Secretaries, Taxation Experts, and Corporate Legal Advisors who
                operate with independence, integrity, and accountability.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Our Approach
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                Our approach is structured, client-focused, and solution-driven
                — enabling entrepreneurs, startups, SMEs, and corporate entities
                to focus on growth while we ensure regulatory clarity, statutory
                compliance, and strategic financial guidance.
              </p>
            </div>
          </div>

          <section className="bg-slate-900 p-8 md:p-12 rounded-3xl shadow-lg text-center border border-slate-800">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Our Foundation
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Professionalism</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Transparency</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Long-term Partnership</span>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl mx-auto">
              At TCG, professionalism, transparency, and long-term partnership
              form the foundation of every client engagement.
            </p>
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
