import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getGuestSession } from '../utils/guestSession';

const SessionAlert = () => {
  const { isGuest } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Helper to calculate hours left
  const getHoursLeft = () => {
    const session = getGuestSession();
    if (session) {
      const createdAt = new Date(session.createdAt);
      const expiresAt = new Date(createdAt.getTime() + 72 * 60 * 60 * 1000);
      const now = new Date();
      return Math.ceil((expiresAt - now) / (1000 * 60 * 60));
    }
    return null;
  };

  useEffect(() => {
    if (isGuest) {
      const updateTime = () => {
        const hoursLeft = getHoursLeft();
        if (hoursLeft !== null && hoursLeft <= 12 && hoursLeft > 0) {
          setTimeLeft(hoursLeft);
          setShowAlert(true);
        } else {
          setShowAlert(false);
        }
      };
      updateTime();
      const interval = setInterval(updateTime, 60 * 1000); // update every minute
      return () => clearInterval(interval);
    } else {
      setShowAlert(false);
    }
  }, [isGuest]);

  if (!showAlert) return null;

  return (
    <div className="session-alert">
      <div className="session-alert-content">
        <div className="session-alert-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <div className="session-alert-text">
          <p className="session-alert-title">Guest Session Expiring Soon</p>
          <p>Your guest session will expire in {timeLeft} hour{timeLeft !== 1 ? 's' : ''}. Sign up to save your work permanently.</p>
        </div>
        <button 
          onClick={() => setShowAlert(false)}
          className="session-alert-close"
          aria-label="Close alert"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SessionAlert;