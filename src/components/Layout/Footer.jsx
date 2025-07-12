import { Link } from 'react-router-dom';
import Disclaimer from '../Disclaimer';  // Corrected path

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="responsive-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold text-primary">PatentCraft AI</span>
            </div>
            <p className="text-muted">
              Transforming inventions into professionally drafted patent applications
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <Disclaimer />
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 text-center text-muted text-sm">
          © {new Date().getFullYear()} PatentCraft AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;