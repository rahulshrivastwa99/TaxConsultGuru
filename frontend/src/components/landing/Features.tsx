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
          {/* Left Column: Grid Layout */}
          <div className="order-last lg:order-first grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-8 lg:mt-0">
            {/* Dark Hero Card */}
            <div className="sm:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight text-white">
                  Built for Modern Businesses
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base max-w-[90%] font-medium">
                  Skip the traditional firm delays. We connect you directly with
                  verified financial experts through a secure, tech-driven
                  platform designed for speed and transparency.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 hover:bg-white/15 transition-colors cursor-default">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide">
                    Vetted CA Network
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 hover:bg-white/15 transition-colors cursor-default">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide">
                    Zero Hidden Fees
                  </span>
                </div>
              </div>
            </div>

            {/* Top Rated Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <h4 className="text-2xl font-black text-slate-900">Top Rated</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                Verified Experts
              </p>
            </div>

            {/* Legal Tech Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 leading-tight">
                Legal Tech
              </h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mt-1">
                Innovative Platform
              </p>
            </div>

            {/* Safe & Secure Documents - Fixed Horizontal Layout */}
            <div className="sm:col-span-2 bg-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex items-center gap-5 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold tracking-tight">
                  Safe & Secure Documents
                </h4>
                <p className="text-indigo-200 text-sm mt-1 font-medium">
                  Bank-grade encryption for all your files.
                </p>
              </div>
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
              We've built a platform that simplifies complex regulatory
              requirements into manageable steps, ensuring your business stays
              compliant without the traditional headaches of legal paperwork.
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
