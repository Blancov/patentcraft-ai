import SignUpForm from '../components/Auth/SignUpForm';

const SignUp = () => (
  <div className="login-bg">
    <div className="login-center">
      <div className="login-card">
        <div className="login-header">
          {/* Optional: Add your logo here */}
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">
            Register to unlock your innovation
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  </div>
);

export default SignUp;