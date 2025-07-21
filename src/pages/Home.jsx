import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const features = [
  {
    icon: "⚡",
    title: "AI-Powered Drafting",
    description: "Generate USPTO-compliant drafts in seconds using advanced AI algorithms"
  },
  {
    icon: "🔍",
    title: "Prior Art Detection",
    description: "Identify potential conflicts early with intelligent patent analysis"
  },
  {
    icon: "🔒",
    title: "Secure Storage",
    description: "Military-grade encryption for your intellectual property"
  },
  {
    icon: "📄",
    title: "Export to PDF",
    description: "One-click export for professional patent applications"
  },
  {
    icon: "🔄",
    title: "Version History",
    description: "Track changes and restore previous versions anytime"
  },
  {
    icon: "🌎",
    title: "Global Compliance",
    description: "Supports patent formats for all major jurisdictions"
  }
];

const Home = () => {
  const { isGuest, startGuestSession, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) {
      navigate("/draft");
    }
  }, [isGuest, navigate]);

  const handleGuestStart = () => {
    startGuestSession();
    // navigation handled by useEffect above
  };

  const handleCreateAccount = () => {
    navigate("/signup"); // Change to "/register" if that's your route
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <main className="home-page">
      <section className="hero-section text-center py-16">
        <h1 className="text-4xl font-bold mb-4 text-primary">PatentCraft AI</h1>
        <p className="text-lg text-gray-600 mb-8">
          The fastest way to draft, analyze, and export professional patent applications.
        </p>
        <div className="hero-actions flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            className="btn-primary px-8 py-3 text-lg rounded-full"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
          <button
            className="btn-outline px-8 py-3 text-lg rounded-full"
            onClick={handleGuestStart}
          >
            Try as Guest
          </button>
        </div>
      </section>

      <section className="features-section py-12 bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card flex flex-col items-center bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-primary">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;