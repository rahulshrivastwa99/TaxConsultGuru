import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Tax
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Consult
              </span>
              Guru
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 font-medium">
            Last updated: October 2023
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use TaxConsultGuru, we collect the following types of
              information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address,
                phone number, and billing details.
              </li>
              <li>
                <strong>Business Information:</strong> Company name,
                registration details, GST numbers, and financial documents
                necessary for expert consultation.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact
                with our platform, including IP addresses and browser types.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-3">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our managed marketplace.</li>
              <li>Connect you with verified Chartered Accountants.</li>
              <li>
                Process transactions and send related information, including
                confirmations and invoices.
              </li>
              <li>Provide customer support and resolve disputes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. Data Security & "Double-Blind" Protection
            </h2>
            <p>
              We take security seriously. We use a "Double-Blind Privacy
              Protection" system. This means your sensitive contact information
              is hidden from the expert until a secure workspace is unlocked via
              payment. All files shared within the workspace are encrypted and
              only accessible to you, the assigned expert, and the platform
              administrators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Sharing Your Information
            </h2>
            <p>
              We do not sell your personal information. We only share your
              information with the specific Chartered Accountant assigned to
              your job, and only the information strictly necessary to complete
              the requested service.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-extrabold tracking-tight text-white mb-4">
            Tax<span className="text-indigo-400">Consult</span>Guru
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
