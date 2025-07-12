import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logEvent } from '../../utils/analytics';

const SignUpForm = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signUp(email, password);
      logEvent('Authentication', 'Sign Up', 'Success');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      logEvent('Authentication', 'Sign Up Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      {success ? (
        <div className="success-message">
          <h2>Check Your Email!</h2>
          <p>We've sent a confirmation link to {email}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="auth-btn"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignUpForm;