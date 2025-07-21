import { Outlet } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import Footer from './Footer';
import SessionAlert from '../SessionAlert';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <SessionAlert />
      <main className="flex-grow w-full py-6">
        <div className="responsive-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;