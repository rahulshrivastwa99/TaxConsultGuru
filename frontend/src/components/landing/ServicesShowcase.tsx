import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Landmark,
  FileBadge,
  ShieldCheck,
  TreeDeciduous,
  Receipt,
  Lightbulb,
  FileText,
} from "lucide-react";

// Added specific icons for each category to make it look premium
const categories = [
  {
    id: "business",
    name: "Business Registration",
    subtitle: "We help you register your business",
    icon: Building2,
  },
  {
    id: "government",
    name: "Government Registration",
    subtitle: "Get govt. registration certificates",
    icon: Landmark,
  },
  {
    id: "licenses",
    name: "Government Licenses",
    subtitle: "Getting govt. licenses with us is easy",
    icon: FileBadge,
  },
  {
    id: "rbi",
    name: "RBI Regulatory",
    subtitle: "Streamline compliance with our experts",
    icon: ShieldCheck,
  },
  {
    id: "environment",
    name: "Environment Laws",
    subtitle: "We ensure eco-sustainable growth",
    icon: TreeDeciduous,
  },
  {
    id: "tax",
    name: "Tax Filing",
    subtitle: "We simplify the process of tax filing",
    icon: Receipt,
  },
  {
    id: "ipr",
    name: "IPR",
    subtitle: "We provide top-notch IPR Services",
    icon: Lightbulb,
  },
];

const servicesData: Record<string, any[]> = {
  business: [
    {
      title: "Company Registration",
      description:
        "Company Registration in India Save 50% Today on Professional Services Avail consultation from our seasoned consultants for expert suppor..",
    },
    {
      title: "LLP Registration",
      description:
        "LLP Registration- Register a Limited Liability Partnership in 1 Week Are you a business enthusiast seeking LLP registration in India? If..",
    },
    {
      title: "One Person Company Registration",
      description:
        "One Person Company Registration Facing challenges in making the desired choice for solopreneurs? Get expert assistance for easy-breezy On..",
    },
    {
      title: "Partnership Firm Registration",
      description:
        "Partnership Firm Registration in India Grab 50% Off on TaxConsultGuru® Expert Services Are you seeking partnership firm registration in Ind..",
    },
  ],
  government: [
    {
      title: "GST Registration",
      description:
        "GST Registration Online Step-by-Step (REG-01) & Expert Help Are you facing challenges during GST registration? Get your GSTIN quickl..",
    },
    {
      title: "MSME / Udyam",
      description:
        "MSME Udyam Registration in India - Avail benefits and subsidies provided by the government to micro, small, and medium enterprises..",
    },
    {
      title: "FSSAI License",
      description:
        "FSSAI License Registration Online Get your food business registered quickly. Ensure compliance and build trust with your customers..",
    },
    {
      title: "Import Export Code",
      description:
        "IEC Code Registration Take your business global. Get your Import Export Code seamlessly with our expert guidance and support..",
    },
  ],
  licenses: [
    {
      title: "Trade License",
      description:
        "Trade License Registration - Start your business legally. We assist in obtaining municipal trade licenses without the standard hassle..",
    },
    {
      title: "PSARA License",
      description:
        "PSARA License for Private Security Agencies. Navigate the complex regulatory framework with our dedicated licensing experts..",
    },
    {
      title: "Drug License",
      description:
        "Drug License Registration - Mandatory for manufacturing, selling, or distributing drugs and cosmetics in India. Get compliant today..",
    },
    {
      title: "Fire NOC",
      description:
        "Fire No Objection Certificate. Ensure your commercial premises meet all safety regulations and secure your Fire NOC efficiently..",
    },
  ],
  rbi: [
    {
      title: "NBFC Registration",
      description:
        "NBFC Registration in India Save 50% Today on Professional Services Is your business engaged in financial activities such as..",
    },
    {
      title: "NBFC Takeover",
      description:
        "NBFC Takeover- Avail 50% Off on Professional Fees Are you looking for an NBFC takeover in India? Talk to our experts at Co..",
    },
    {
      title: "FFMC License",
      description:
        "FFMC License in India Are you all set to operate legally in the foreign exchange market? If yes, you must opt for the FFMC license in In..",
    },
    {
      title: "Microfinance Company Registration",
      description:
        "Microfinance Company Registration Experience Smooth Funding and get reasonable Microfinance company registration services for small..",
    },
  ],
  environment: [
    {
      title: "EPR Fulfillment in E-Waste Management",
      description:
        "EPR Compliance for E-Waste Management Achieve effortless EPR compliance for E-Waste management with TaxConsultGuru. Let experts guide y..",
    },
    {
      title: "E-Waste Recycling Authorization",
      description:
        "E-Waste Recycling Authorization Ready to get your e-waste recycling authorization? Let TaxConsultGuru guide you in taking the first step..",
    },
    {
      title: "Refurbisher Authorization and License",
      description:
        "Refurbisher Authorization and License Ready to obtain your refurbisher authorization and license? Ensure compliance, build trust, and dri..",
    },
    {
      title: "Plastic Waste Authorization",
      description:
        "Plastic Waste Authorization in India Get 50% off on Professional Services Today Unmanaged plastic waste can harm your brand's..",
    },
  ],
  tax: [
    {
      title: "GST Registration",
      description:
        "GST Registration Online Step-by-Step (REG-01) & Expert Help Are you facing challenges during GST registration? Get your GSTIN quickl..",
    },
    {
      title: "TDS Return Filing",
      description:
        "TDS Return Filing Online- File TDS Return in 1 Hour Received a TDS notice? At TaxConsultGuru, we have successfully solved 99% cas..",
    },
    {
      title: "GST Return Filing",
      description:
        "GST Return Filing Starting from Just ₹ 999/ Month Do you want to maximize your input tax credit while filing GST? Talk to our experts..",
    },
    {
      title: "Professional Tax Registration",
      description:
        "Professional Tax Registration - Get Compliant from Day 1 Are you paying salaries without professional tax registration? If you ha..",
    },
  ],
  ipr: [
    {
      title: "Trademark Assignment",
      description:
        "Trademark Assignment To transfer the ownership of a trademark from one party to another whether along with or without the goodwill of the..",
    },
    {
      title: "Trademark Objection",
      description:
        "Trademark Objection- Get First Drafted Reply in 1 Hour Get TaxConsultGuru expert-led support for the trademark objection reply in..",
    },
    {
      title: "Trademark Registration",
      description:
        "Trademark Registration in India Avail 50% Off on Professional Services Are you finding it difficult to register for a trademark?..",
    },
    {
      title: "Trademark Rectification",
      description:
        "Trademark Rectification in India In Just ₹2499 +Govt.Fee Did you discover an error in the trademark registration? If yes, get..",
    },
  ],
};

const ServicesShowcase = () => {
  const [activeCategory, setActiveCategory] = useState("business");

  return (
    // ID added here so the "Services" nav link scrolls perfectly to this section
    <section
      id="services-section"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-cyan-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Legal Help Across <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
              Wide Range of Services
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            TaxConsultGuru focuses predominantly on assisting entrepreneurs and
            SMEs by providing services such as Business Registration, Government
            Registration, Regulatory Measures, Tax Filing, IPR, and much more.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-3 md:p-5 border border-slate-200 flex flex-col lg:flex-row gap-5 shadow-sm">
          {/* Left Sidebar - Light Theme Navigation */}
          <div className="lg:w-[32%] flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-hide">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`min-w-[220px] sm:min-w-[280px] lg:min-w-0 shrink-0 flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left transition-all duration-300 rounded-2xl border ${
                    isActive
                      ? "bg-white shadow-md shadow-indigo-100/50 border-slate-200 ring-1 ring-indigo-500/10"
                      : "bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h3
                      className={`font-bold text-[15px] leading-tight transition-colors duration-300 ${
                        isActive ? "text-indigo-950" : "text-slate-700"
                      }`}
                    >
                      {category.name}
                    </h3>
                    <p
                      className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                        isActive ? "text-indigo-600/70" : "text-slate-400"
                      }`}
                    >
                      {category.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Area - Cards */}
          <div className="lg:w-[68%] bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div
              key={activeCategory}
              className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500 ease-out"
            >
              {servicesData[activeCategory].map((service, index) => (
                <div
                  key={index}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-300 transition-all duration-300 flex flex-col h-full cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300 border border-amber-100 group-hover:border-indigo-100">
                      <FileText size={22} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight pt-1 group-hover:text-indigo-700 transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 font-medium">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <span className="inline-flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      read more{" "}
                      <ArrowRight
                        size={16}
                        className="ml-1.5 group-hover:translate-x-1 transition-transform"
                      />
                    </span>
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
