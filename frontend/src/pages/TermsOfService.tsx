import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 font-medium">
            Please read these terms carefully before using our platform.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using TaxConsultGuru, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. Description of Service
            </h2>
            <p>
              TaxConsultGuru provides a managed marketplace that connects
              businesses and individuals ("Clients") with verified Chartered
              Accountants ("Experts") for tax compliance, company registration,
              and financial services. We act as an intermediary to facilitate
              communication, secure file sharing, and payment processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. User Conduct & Anti-Spam Policy
            </h2>
            <p className="mb-3">
              Users agree to use the platform strictly for professional
              purposes. The following behaviors are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Sharing direct contact information (phone numbers, personal
                emails) in job descriptions or bridge chats before a workspace
                is officially unlocked.
              </li>
              <li>
                Bypassing the platform's payment system to conduct transactions
                directly with an expert.
              </li>
              <li>
                Posting fraudulent, misleading, or illegal service requests.
              </li>
            </ul>
            <p className="mt-3 text-red-600 font-medium">
              Violation of these terms may result in immediate account
              suspension by the Admin team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Payments and Payouts
            </h2>
            <p>
              Clients agree to pay the agreed-upon budget before a secure
              workspace is unlocked. Experts agree that TaxConsultGuru will
              deduct a standard platform fee (e.g., 10%) from the gross budget
              before releasing the final net payout upon project completion.
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

export default TermsOfService;
