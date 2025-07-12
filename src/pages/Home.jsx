import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IdeaForm from '../components/Form/IdeaForm';
import ResponsiveContainer from '../components/Layout/ResponsiveContainer';
import { useAuth } from '../hooks/useAuth';
import FeatureCard from '../components/FeatureCard';

const Home = () => {
  const { user, loading, isGuest, startGuestSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest !== null) {
      window.gtag('event', isGuest ? 'guest_session' : 'authenticated_session', {
        event_category: 'engagement',
        event_label: 'session_type'
      });
    }
  }, [isGuest]);

  const handleGuestStart = () => {
    startGuestSession();
    window.gtag('event', 'guest_session_start', {
      event_category: 'engagement'
    });
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="responsive-container">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">PatentCraft AI</h1>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
          Transform your invention into a professionally drafted patent application
        </p>
        
        <div className="card">
          {user ? (
            <IdeaForm />
          ) : (
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="md:w-1/2 text-left">
                <h2 className="text-2xl font-bold mb-6">Experience the Power</h2>
                <ul className="space-y-4 mb-8">
                  {[
                    "Generate USPTO-compliant drafts instantly",
                    "AI-powered prior art detection",
                    "Export to PDF with one click"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-900/30 p-1 rounded-full mr-3 mt-0.5">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/signup')} 
                    className="btn-primary"
                  >
                    Create Account
                  </button>
                  <button 
                    onClick={handleGuestStart}
                    className="btn-secondary"
                  >
                    Try as Guest
                  </button>
                </div>
                
                <p className="text-sm text-muted mt-4">
                  Guest sessions save drafts locally for 72 hours. Sign up to save permanently.
                </p>
              </div>
              
              <div className="md:w-1/2">
                <div className="bg-gray-800 border border-gray-700 rounded-xl w-full aspect-video flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-primary text-6xl mb-4">⚡</div>
                    <h3 className="text-2xl font-bold mb-2">AI-Powered Patent Drafting</h3>
                    <p className="text-muted">Turn your ideas into professional patents</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="my-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Our AI-powered platform simplifies patent drafting with powerful features
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "AI-Powered Drafting", 
              description: "Generate USPTO-compliant drafts in seconds", 
              icon: "⚡" 
            },
            { 
              title: "Prior Art Detection", 
              description: "Identify potential conflicts early in the process", 
              icon: "🔍" 
            },
            { 
              title: "Secure Storage", 
              description: "Save and manage your drafts securely", 
              icon: "🔒" 
            }
          ].map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;