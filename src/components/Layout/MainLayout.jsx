import { Outlet } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';  // Fixed path
import Footer from './components/Layout/Footer';
import ThemeToggle from './components/ThemeToggle';   // Fixed path
import SessionAlert from './components/SessionAlert';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      <Navbar />
      <SessionAlert />
      
      <main className="flex-grow">
        <div className="responsive-container">
          <div className="container-inner">
            <Outlet />
          </div>
        </div>
      </main>
      
      <Footer />
      <ThemeToggle className="fixed bottom-4 right-4 z-50" />
    </div>
  );
};

export default MainLayout;