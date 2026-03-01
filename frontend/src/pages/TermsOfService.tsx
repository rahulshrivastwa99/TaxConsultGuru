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
            Terms & Conditions
          </h1>
          <p className="text-slate-500 font-medium">
            By accessing or using the website of TCG – TaxConsultGuru, you agree
            to be bound by these Terms & Conditions.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              1. Nature of the Platform & Services
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                TCG – TaxConsultGuru is a professional consulting platform
                providing taxation, compliance, incorporation, regulatory, and
                advisory services.
              </li>
              <li>
                We operate through a network of independent professionals
                including Chartered Accountants, Company Secretaries, Tax
                Consultants, and Legal Advisors.
              </li>
              <li>
                TCG does not act as a government authority or regulatory body.
              </li>
              <li>
                Engagement with TCG does not automatically create a partnership,
                employment, or agency relationship between the user and TCG or
                any associated professional unless expressly agreed in writing.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. Terms for Clients / Users
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                All information and documents provided must be true, accurate,
                and complete.
              </li>
              <li>
                You are responsible for timely submission of required documents
                and information.
              </li>
              <li>
                You understand that approvals from government authorities are
                subject to their discretion.
              </li>
              <li>
                TCG shall not be responsible for delays caused due to incomplete
                or incorrect information provided by the user.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. Terms for Associated Professionals
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                The Professional shall act as an independent service provider
                and not as an employee, partner, or agent of TCG.
              </li>
              <li>
                Upon receiving a lead notification, the Professional must submit
                a detailed quotation including scope, timelines, and
                professional fees. Direct quotation submission to the client
                without TCG’s authorization is strictly prohibited.
              </li>
              <li>
                25% of the approved professional fee shall be payable to TCG as
                commission, while 75% of the approved professional fee shall be
                payable to the Professional.
              </li>
              <li>
                After successful completion of the first project, the
                Professional agrees to subscribe to the platform (Monthly Plan –
                ₹199, Quarterly Plan – ₹1,099, Yearly Plan – ₹2,099).
              </li>
              <li>
                The Professional agrees not to bypass TCG by directly engaging,
                soliciting, or accepting assignments from any client introduced
                through the TCG platform. This non-circumvention obligation
                remains in effect during the association and for a period of 24
                months after termination.
              </li>
              <li>
                Breach of these terms may result in immediate termination,
                cancellation of ongoing assignments, and withholding of unpaid
                commissions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Refund & Cancellation Policy
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Once work has commenced, fees are non-refundable.</li>
              <li>
                Government fees, statutory fees, and third-party charges are
                strictly non-refundable.
              </li>
              <li>
                If cancellation is requested before work initiation, refund may
                be processed after deducting administrative charges.
              </li>
              <li>
                Clients may request cancellation by sending written
                communication to: info@taxconsultguru.com.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              5. Limitation of Liability & Legal
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                Our liability, if any, shall be limited to the amount of
                professional fees paid for the specific service.
              </li>
              <li>
                TCG shall not be liable for indirect, incidental, or
                consequential damages.
              </li>
              <li>
                All content on the Platform including text, logos, graphics, and
                design elements are the property of TCG – TaxConsultGuru and may
                not be reproduced without written permission.
              </li>
              <li>
                These Terms shall be governed by the laws of India. Any disputes
                shall be referred to arbitration under the Arbitration and
                Conciliation Act, 1996, with the seat of arbitration at Delhi,
                India.
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-black tracking-tight text-white mb-4">
            TaxConsult<span className="text-indigo-400">Guru</span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-4">
            TCG – TaxConsultGuru is a professional consulting platform providing
            taxation, compliance, and advisory services. We are not a government
            authority. [cite_start]All approvals are subject to respective
            government departments[cite: 49, 50].
          </p>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
