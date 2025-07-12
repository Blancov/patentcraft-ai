import LoginForm from '../components/Auth/LoginForm';
import ResponsiveContainer from '../components/Layout/ResponsiveContainer';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <ResponsiveContainer>
        <div className="max-w-md w-full p-6 bg-card rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted">Sign in to access your patent drafting dashboard</p>
          </div>
          <LoginForm />
        </div>
      </ResponsiveContainer>
      <ThemeToggle className="absolute top-4 right-4" />
    </div>
  );
};

export default Login;