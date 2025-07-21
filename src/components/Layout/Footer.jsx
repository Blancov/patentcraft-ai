import { Link } from 'react-router-dom';
import Disclaimer from '../Disclaimer';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="responsive-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Legal/Disclaimer */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <div className="disclaimer" style={{ textAlign: "justify" }}>
              <Disclaimer />
            </div>
          </div>
          {/* Column 2: Contact & Social */}
          <div className="flex flex-col items-center text-center gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <a
                href="mailto:support@patentcraft.ai"
                style={{ color: "var(--primary)" }}
              >
                support@patentcraft.ai
              </a>
              <div className="flex justify-center gap-4 mt-4">
                <a href="https://twitter.com/patentcraftai" aria-label="Twitter" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                  {/* ...Twitter SVG... */}
                </a>
                <a href="https://linkedin.com/company/patentcraftai" aria-label="LinkedIn" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                  {/* ...LinkedIn SVG... */}
                </a>
                <a href="https://github.com/patentcraftai" aria-label="GitHub" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                  {/* ...GitHub SVG... */}
                </a>
              </div>
            </div>
          </div>
          {/* Column 3: Quick Links */}
          <div className="flex flex-col items-center text-center gap-2">
            <h3 className="footer-quicklinks-title text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="footer-quicklinks-list space-y-2">
              <li>
                <Link to="/about" style={{ color: "var(--primary)" }}>About Us</Link>
              </li>
              <li>
                <Link to="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" style={{ color: "var(--primary)" }}>Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center text-muted text-sm" style={{ paddingBottom: "2rem" }}>
          © {new Date().getFullYear()} PatentCraft AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;