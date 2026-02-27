// src/components/landing/Footer.tsx

interface FooterProps {
  onLogoClick: () => void;
}

const Footer = ({ onLogoClick }: FooterProps) => {
  return (
    <footer className="mt-auto py-16 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div
              className="flex items-center mb-6 cursor-pointer hover:opacity-80 transition-opacity text-2xl font-extrabold tracking-tight text-white"
              onClick={onLogoClick}
            >
              <span>Tax</span>
              <span className="text-indigo-400">Consult</span>
              <span>Guru</span>
            </div>

            <p className="text-slate-400 max-w-sm leading-relaxed">
              India's most trusted managed marketplace connecting businesses
              with top-tier Chartered Accountants. Fast, secure, and reliable.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <a
                  href="/about" // <--- Updated link
                  className="hover:text-indigo-400 cursor-pointer transition-colors block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-400 cursor-pointer transition-colors block"
                >
                  For CA Experts
                </a>
              </li>
              <li>
                <a
                  href="/#services-section"
                  className="hover:text-indigo-400 cursor-pointer transition-colors block"
                >
                  Browse Services
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white cursor-pointer transition-colors block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-white cursor-pointer transition-colors block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white cursor-pointer transition-colors block"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
          <p className="mt-2 md:mt-0">Designed for Professional Excellence</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
