// src/pages/Landing.tsx
import { useState } from "react";
import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import ServicesShowcase from "../components/landing/ServicesShowcase";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";
import AuthModal from "../components/landing/AuthModal";

const Landing = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "ca">("client");
  const [isRegister, setIsRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- ACTIONS & HANDLERS ---
  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleServicesClick = () => {
    setMobileMenuOpen(false);
    // Note: Make sure your ServicesShowcase component has an id="services-section" in its top div
    const section = document.getElementById("services-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExpertsClick = () => {
    setMobileMenuOpen(false);
    setActiveTab("ca");
    setIsRegister(true);
    setLoginOpen(true);
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    setActiveTab("client");
    setIsRegister(true);
    setLoginOpen(true);
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    setIsRegister(false);
    setActiveTab("client");
    setLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/20 overflow-x-hidden flex flex-col">
      {/* --- INJECTED CUSTOM CSS FOR SMOOTH FLOATING ANIMATIONS --- */}
      <style>{`
        @keyframes customFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: customFloat 6s ease-in-out infinite;
        }
      `}</style>

      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogoClick={handleLogoClick}
        onServicesClick={handleServicesClick}
        onExpertsClick={handleExpertsClick}
        onLoginClick={handleLoginClick}
        onGetStartedClick={handleGetStartedClick}
      />

      <Hero
        onLearnMoreClick={handleGetStartedClick}
        onServiceClick={(service) => {
          console.log(`Selected service: ${service}`);
          handleServicesClick();
        }}
      />

      {/* SHIFTED LAYOUT FOR A PROFESSIONAL FLOW:
        1. Features (Trust building)
        2. How It Works (Process)
        3. Services Showcase (The 6 boxes shifted down) 
      */}

      <Features />

      <HowItWorks />

      <ServicesShowcase />

      <Footer onLogoClick={handleLogoClick} />

      <AuthModal
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRegister={isRegister}
        setIsRegister={setIsRegister}
      />
    </div>
  );
};

export default Landing;
