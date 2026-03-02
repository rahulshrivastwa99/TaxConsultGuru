// src/components/landing/Features.tsx
import { CheckCircle2, ShieldCheck, Star, Award, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Confidential & Safe",
      text: "All your data and documents are stored with end-to-end encryption. We prioritize your privacy above everything else.",
    },
    {
      title: "Quick Response",
      text: "We make sure to answer all your queries within 24 hours. Our dedicated support team is always ready to help you.",
    },
    {
      title: "Expert Guidance",
      text: "Get advice from top-tier Chartered Accountants and legal experts with years of experience in the industry.",
    },
    {
      title: "Transparent Pricing",
      text: "No hidden costs or surprises. We provide clear, upfront pricing for all our services before we start.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Visuals (Masonry-style) */}
          <div className="order-last lg:order-first grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 lg:mt-0">
            <div className="sm:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col justify-between h-auto sm:h-64 shadow-xl">
              <div>
                <h3 className="text-3xl font-extrabold mb-4">Why TaxConsultGuru?</h3>
                <p className="text-slate-400 leading-relaxed">
                  We combine technology with professional expertise to deliver a seamless compliance experience.
                </p>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold">
                    U{i}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <h4 className="text-2xl font-black text-slate-900">99.9%</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Client Satisfaction</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow sm:translate-y-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 leading-tight">Largest Legal Tech</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mt-1">Across India</p>
            </div>
            
            <div className="col-span-1 bg-indigo-600 rounded-3xl p-6 text-white shadow-lg sm:-translate-y-8">
               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm font-bold">Safe & Secure Documents</p>
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-indigo-600 tracking-wide uppercase">
                Our Features
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Features of Our <br /> Legal Service
            </h2>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              We've built a platform that simplifies complex regulatory requirements 
              into manageable steps, ensuring your business stays compliant without 
              the traditional headaches of legal paperwork.
            </p>

            <ul className="space-y-8">
              {features.map((feature, index) => (
                <li key={index} className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
