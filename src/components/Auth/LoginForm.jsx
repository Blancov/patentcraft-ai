import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logEvent } from '../../utils/analytics';

const LoginForm = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      logEvent('Authentication', 'Login', 'Success');
    } catch (err) {
      setError(err.message);
      logEvent('Authentication', 'Login Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
};

export default LoginForm;