import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';  // Corrected services path
import { getGuestSession, clearGuestSession } from './utils/guestSession'; 


// Create context
const AuthContext = createContext();

// Main provider component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  // Fetch user session and profile
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        
        // Check for guest session first
        const guestSession = getGuestSession();
        if (guestSession.id && !user) {
          setUser({
            id: guestSession.id,
            isGuest: true,
            createdAt: guestSession.createdAt
          });
          setIsGuest(true);
          setLoading(false);
          return;
        }
        
        // Get current session for authenticated users
        const { data: { session }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        setUser(session?.user || null);
        setIsGuest(false);
        
        // Fetch user profile if authenticated
        if (session?.user) {
          await fetchUserProfile(session.user.id);
          await fetchSubscription(session.user.id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsGuest(false);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
          await fetchSubscription(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user]); // Added user to dependency array

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(`Profile error: ${err.message}`);
    }
  };

  // Fetch subscription status
  const fetchSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data || { status: 'free', draft_count: 0 });
    } catch (err) {
      setError(`Subscription error: ${err.message}`);
    }
  };

  // Start guest session
  const startGuestSession = () => {
    const session = getGuestSession();
    setUser({
      id: session.id,
      isGuest: true,
      createdAt: session.createdAt
    });
    setIsGuest(true);
    window.gtag('event', 'guest_session_start', {
      event_category: 'engagement'
    });
  };

  // User authentication methods
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            created_at: new Date().toISOString()
          }
        }
      });
      
      if (error) throw error;
      
      // Create profile record
      if (data.user) {
        await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id, 
            email: data.user.email,
            plan: 'free',
            draft_count: 0
          }]);
      }
      
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      if (user?.isGuest) {
        clearGuestSession();
      } else {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsGuest(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Value to provide to consumers
  const value = {
    user,
    profile,
    subscription,
    isGuest,
    loading,
    error,
    startGuestSession,
    signUp,
    signIn,
    signOut,
    resetError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export component
export { AuthProvider };