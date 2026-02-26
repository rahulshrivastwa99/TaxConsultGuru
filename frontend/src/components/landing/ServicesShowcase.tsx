// src/components/landing/ServicesShowcase.tsx
import { useState } from "react";
import { BarChart3, ArrowRight } from "lucide-react";

const categories = [
  { 
    id: "business", 
    name: "Business Registration", 
    subtitle: "We help you register your business" 
  },
  { 
    id: "government", 
    name: "Government Registration", 
    subtitle: "Get govt. registration certificates" 
  },
  { 
    id: "licenses", 
    name: "Government Licenses", 
    subtitle: "Getting govt. licenses with us is easy" 
  },
  { 
    id: "rbi", 
    name: "RBI Regulatory", 
    subtitle: "Streamline compliance with our experts" 
  },
  { 
    id: "environment", 
    name: "Environment Laws", 
    subtitle: "We ensure eco-sustainable growth" 
  },
  { 
    id: "tax", 
    name: "Tax Filing", 
    subtitle: "We simplify the process of tax filing" 
  },
  { 
    id: "ipr", 
    name: "IPR", 
    subtitle: "We provide top-notch IPR Services" 
  },
];

const servicesData: Record<string, any[]> = {
  business: [
    { title: "Company Registration", description: "Company Registration in India Save 50% Today on Professional Services Avail consultation from our seasoned consultants for expert suppor.." },
    { title: "LLP Registration", description: "LLP Registration- Register a Limited Liability Partnership in 1 Week Are you a business enthusiast seeking LLP registration in India? If.." },
    { title: "One Person Company Registration", description: "One Person Company Registration Facing challenges in making the desired choice for solopreneurs? Get expert assistance for easy-breezy On.." },
    { title: "Partnership Firm Registration", description: "Partnership Firm Registration in India Grab 50% Off on TaxConsultGuru® Expert Services Are you seeking partnership firm registration in Ind.." },
  ],
  government: [
    { title: "GST Registration", description: "GST Registration Online Step-by-Step (REG-01) & Expert Help Are you facing challenges during GST registration? Get your GSTIN quickl.." },
    { title: "MSME / Udyam", description: "MSME Udyam Registration in India - Avail benefits and subsidies provided by the government to micro, small, and medium enterprises.." },
    { title: "FSSAI License", description: "FSSAI License Registration Online Get your food business registered quickly. Ensure compliance and build trust with your customers.." },
    { title: "Import Export Code", description: "IEC Code Registration Take your business global. Get your Import Export Code seamlessly with our expert guidance and support.." },
  ],
  licenses: [
    { title: "Trade License", description: "Trade License Registration - Start your business legally. We assist in obtaining municipal trade licenses without the standard hassle.." },
    { title: "PSARA License", description: "PSARA License for Private Security Agencies. Navigate the complex regulatory framework with our dedicated licensing experts.." },
    { title: "Drug License", description: "Drug License Registration - Mandatory for manufacturing, selling, or distributing drugs and cosmetics in India. Get compliant today.." },
    { title: "Fire NOC", description: "Fire No Objection Certificate. Ensure your commercial premises meet all safety regulations and secure your Fire NOC efficiently.." },
  ],
  rbi: [
    { title: "NBFC Registration", description: "NBFC Registration in India Save 50% Today on Professional Services Is your business engaged in financial activities such as.." },
    { title: "NBFC Takeover", description: "NBFC Takeover- Avail 50% Off on Professional Fees Are you looking for an NBFC takeover in India? Talk to our experts at Co.." },
    { title: "FFMC License", description: "FFMC License in India Are you all set to operate legally in the foreign exchange market? If yes, you must opt for the FFMC license in In.." },
    { title: "Microfinance Company Registration", description: "Microfinance Company Registration Experience Smooth Funding and get reasonable Microfinance company registration services for small.." },
  ],
  environment: [
    { title: "EPR Fulfillment in E-Waste Management", description: "EPR Compliance for E-Waste Management Achieve effortless EPR compliance for E-Waste management with TaxConsultGuru. Let experts guide y.." },
    { title: "E-Waste Recycling Authorization", description: "E-Waste Recycling Authorization Ready to get your e-waste recycling authorization? Let TaxConsultGuru guide you in taking the first step.." },
    { title: "Refurbisher Authorization and License", description: "Refurbisher Authorization and License Ready to obtain your refurbisher authorization and license? Ensure compliance, build trust, and dri.." },
    { title: "Plastic Waste Authorization", description: "Plastic Waste Authorization in India Get 50% off on Professional Services Today Unmanaged plastic waste can harm your brand's.." },
  ],
  tax: [
    { title: "GST Registration", description: "GST Registration Online Step-by-Step (REG-01) & Expert Help Are you facing challenges during GST registration? Get your GSTIN quickl.." },
    { title: "TDS Return Filing", description: "TDS Return Filing Online- File TDS Return in 1 Hour Received a TDS notice? At TaxConsultGuru, we have successfully solved 99% cas.." },
    { title: "GST Return Filing", description: "GST Return Filing Starting from Just ₹ 999/ Month Do you want to maximize your input tax credit while filing GST? Talk to our experts.." },
    { title: "Professional Tax Registration", description: "Professional Tax Registration - Get Compliant from Day 1 Are you paying salaries without professional tax registration? If you ha.." },
  ],
  ipr: [
    { title: "Trademark Assignment", description: "Trademark Assignment To transfer the ownership of a trademark from one party to another whether along with or without the goodwill of the.." },
    { title: "Trademark Objection", description: "Trademark Objection- Get First Drafted Reply in 1 Hour Get TaxConsultGuru expert-led support for the trademark objection reply in.." },
    { title: "Trademark Registration", description: "Trademark Registration in India Avail 50% Off on Professional Services Are you finding it difficult to register for a trademark?.." },
    { title: "Trademark Rectification", description: "Trademark Rectification in India In Just ₹2499 +Govt.Fee Did you discover an error in the trademark registration? If yes, get.." },
  ],
};

const ServicesShowcase = () => {
  const [activeCategory, setActiveCategory] = useState("business");

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Legal Help Across Wide Range of Services
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-sm md:text-base">
            TaxConsultGuru focuses predominantly on assisting entrepreneurs or SMEs by providing services such as Business Registration, Government Registration, Regulatory Measures, Tax Filing, IPR, and much more.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white border border-slate-100">
          
          {/* Left Sidebar - Dark Theme Navigation */}
          <div className="lg:w-[32%] bg-[#063057] flex flex-col md:overflow-y-auto max-h-[600px] scrollbar-hide">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-start gap-4 p-5 text-left transition-all duration-300 relative group ${
                    isActive 
                      ? "bg-white" 
                      : "hover:bg-white/5 border-b border-white/5"
                  }`}
                >
                  {/* Right orange border indicator for active tab */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-amber-500 rounded-l-md" />
                  )}
                  
                  <div className={`mt-1 ${isActive ? "text-rose-500" : "text-white group-hover:text-rose-300"}`}>
                    <BarChart3 size={24} strokeWidth={2.5} />
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-base mb-1 transition-colors ${
                      isActive ? "text-[#063057]" : "text-white"
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs ${
                      isActive ? "text-slate-500" : "text-blue-100/70"
                    }`}>
                      {category.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Area - Cards */}
          <div className="lg:w-[68%] p-6 lg:p-8 bg-slate-50/50">
            {/* Added a key here so React re-mounts the div, triggering the animation on tab switch */}
            <div 
              key={activeCategory} 
              className="grid md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-8 duration-500 ease-out"
            >
              {servicesData[activeCategory].map((service, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100/80 group hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <BarChart3 size={20} className="text-rose-500" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base font-bold text-[#0056b3] leading-tight pt-1 group-hover:text-indigo-700 transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="mt-auto flex justify-end">
                    <button className="w-8 h-8 rounded-full bg-[#0056b3] text-white flex items-center justify-center group-hover:bg-indigo-700 group-hover:shadow-md transition-all duration-300">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;