import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Cenitar.png';  // Corrected asset path

const Navbar = () => {
  const { user, isGuest } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard', protected: true },
    { path: '/profile', label: 'Profile', protected: true },
  ];

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
      <div className="responsive-container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={Logo} 
              alt="PatentCraft AI" 
              className="h-8 w-8"  // Reduced size for better balance
            />
            <span className="text-xl font-bold text-primary">PatentCraft AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              (!item.protected || user) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium hover:text-primary transition-colors ${
                    location.pathname === item.path 
                      ? 'text-primary font-semibold' 
                      : 'text-text'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            {user && (
              <span className="text-sm text-muted px-3 py-1 bg-bg rounded-full">
                {isGuest ? 'Guest' : user.email.split('@')[0]}
              </span>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border py-4">
          <div className="responsive-container flex flex-col gap-2">
            {navItems.map((item) => (
              (!item.protected || user) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium py-2 px-4 rounded-lg hover:bg-bg ${
                    location.pathname === item.path 
                      ? 'text-primary bg-bg font-semibold' 
                      : 'text-text'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
            {user && (
              <div className="pt-2 mt-2 border-t border-border text-sm text-muted px-4">
                Logged in as: {isGuest ? 'Guest' : user.email}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;