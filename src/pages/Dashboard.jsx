import { useAuth } from '../hooks/useAuth';
import ResponsiveContainer from '../components/Layout/ResponsiveContainer'; 
import LoadingSpinner from '../components/LoadingSpinner'; 

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="dashboard space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">
            Welcome, {user?.email?.split('@')[0] || 'User'} {/* Safe access */}
          </h1>
          <p className="text-muted mt-2">
            Manage your submissions and account details
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Recent Submissions</h2>
            <div className="p-8 bg-card rounded-lg border border-border text-center">
              <p className="text-muted">Submission history will appear here</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Account Status</h2>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p>Email: {user?.email || 'N/A'}</p>
              <p className="mt-2">Plan: Free Tier</p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default Dashboard;