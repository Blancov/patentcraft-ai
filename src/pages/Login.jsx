import LoginForm from '../components/Auth/LoginForm';

const Login = () => (
  <div className="login-bg">
    <div className="login-center">
      <div className="login-card">
        <div className="login-header">
          {/* Optional: Add your logo here */}
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign In to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  </div>
);

export default Login;