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
            Information on our data collection, usage, and protection practices.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              1. Legal Status & Scope
            </h2>
            <p className="mb-3">
              This Privacy Policy is an electronic record in terms of the
              Information Technology Act, 2000. By accessing or using the
              website of TCG – TaxConsultGuru, you acknowledge that you have
              read, understood, and agreed to this Privacy Policy. This policy
              applies to visitors, clients, and users engaging our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, Email Address,
                Contact Number, Address, and regulatory identifiers like PAN,
                Aadhaar, GSTIN, or CIN.
              </li>
              <li>
                <strong>Technical & Usage Information:</strong> IP address,
                browser type, device details, and cookies.
              </li>
              <li>
                <strong>Professional Documents:</strong> Any documents shared
                for incorporation, taxation, compliance, or advisory services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. Purpose & Cloud Storage
            </h2>
            <p className="mb-3">
              Information is collected for providing requested services,
              regulatory filings, client communication, and compliance with
              applicable laws.
            </p>
            <p>
              To ensure secure handling, TCG may store client data and documents
              on secure cloud-based platforms, including Cloudinary. By engaging
              our services, you consent to the storage of data on cloud
              infrastructure and access by authorized professionals strictly for
              service delivery. TCG implements reasonable safeguards but shall
              not be held liable for breaches caused by factors beyond our
              reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Information Sharing & Disclosure
            </h2>
            <p className="mb-3">
              We do not sell or rent personal information. Information may be
              shared only:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With associated professionals for service execution.</li>
              <li>With authorized third-party service providers.</li>
              <li>When required under law or court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              5. User Rights & Data Retention
            </h2>
            <p className="mb-3">
              Client data is retained for the duration necessary to complete
              services and as required under applicable legal obligations.
            </p>
            <p>
              Subject to applicable law, users may request access, correction,
              or deletion of their personal data by submitting a request to:{" "}
              <strong>info@taxconsultguru.com</strong>.
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
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-4">
            TCG – TaxConsultGuru is a professional consulting platform and is
            not a government authority or regulatory body. All registrations,
            approvals, and certifications are subject to the discretion of the
            respective government departments. TCG does not guarantee approval
            from any statutory authority.
          </p>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
