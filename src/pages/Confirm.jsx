import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Corrected context path

const Confirm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } else {
      navigate('/login');
    }
  }, [user, navigate]);
  
  return (
    <div className="confirmation-page">
      <h1>Email Confirmed!</h1>
      <p>Your account has been verified. Redirecting to profile...</p>
    </div>
  );
};

export default Confirm;