import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactSupport = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "Message sent! Our support team will get back to you shortly.",
    );
    // Form reset logic can go here
  };

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
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Need help with a project, have a billing question, or want to report
            an issue? Our expert support team is here for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
              <p className="text-sm text-slate-500 mb-2">For general queries</p>
              <a
                href="mailto:support@taxconsultguru.com"
                className="text-indigo-600 font-semibold hover:underline"
              >
                support@taxconsultguru.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
              <p className="text-sm text-slate-500 mb-2">
                Mon-Fri from 9am to 6pm
              </p>
              <a
                href="tel:+911234567890"
                className="text-cyan-600 font-semibold hover:underline"
              >
                +91 123 456 7890
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Office</h3>
              <p className="text-sm text-slate-500">
                123 Financial Hub, Connaught Place
                <br />
                New Delhi, 110001
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      First Name
                    </label>
                    <Input
                      placeholder="John"
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Last Name
                    </label>
                    <Input
                      placeholder="Doe"
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    required
                    className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    How can we help?
                  </label>
                  <Textarea
                    placeholder="Tell us about your issue..."
                    rows={6}
                    required
                    className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </div>
          </div>
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

export default ContactSupport;
