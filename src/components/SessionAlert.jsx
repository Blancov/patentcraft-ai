import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuestSession } from '../utils/GuestSession';

const SessionAlert = () => {
  const { isGuest } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isGuest) {
      const session = getGuestSession();
      if (session) {
        const createdAt = new Date(session.createdAt);
        const expiresAt = new Date(createdAt.getTime() + 72 * 60 * 60 * 1000);
        const now = new Date();
        const diffHours = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
        
        if (diffHours <= 12) {
          setTimeLeft(diffHours);
          setShowAlert(true);
        }
      }
    }
  }, [isGuest]);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-md z-50">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div>
            <p className="font-bold">Guest Session Expiring Soon</p>
            <p>Your guest session will expire in {timeLeft} hours. Sign up to save your work permanently.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAlert(false)}
          className="text-yellow-700 hover:text-yellow-900 ml-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SessionAlert;