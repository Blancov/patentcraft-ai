import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const Confirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type') || 'signup';
      
      if (!token) {
        navigate('/invalid-token');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token,
        type
      });

      if (error) {
        navigate('/invalid-token');
      } else {
        navigate('/profile');
      }
    };

    if (user) {
      navigate('/profile');
    } else {
      verifyToken();
    }
  }, [user, navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Verifying Your Account</h1>
      <p className="text-lg text-gray-600">
        Please wait while we confirm your email address...
      </p>
      <div className="mt-8 w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Confirm;