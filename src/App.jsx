import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';  // Added ThemeProvider
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Confirm from './pages/Confirm';
import UserProfile from "./components/Profile/UserProfile";
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { logPageView } from './utils/analytics';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    logPageView();
    
    // Focus management for accessibility
    setTimeout(() => {
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    }, 100);
  }, [location]);

  return (
    <AuthProvider>
      <ThemeProvider>  {/* Added ThemeProvider wrapper */}
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/confirm" element={<Confirm />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;