import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../services/supabase';
import { getGuestSession, clearGuestSession } from '../utils/guestSession';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    profile: null,
    subscription: null,
    loading: true,
    error: null,
    isGuest: false
  });

  const fetchUserData = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setAuthState(prev => ({
        ...prev,
        profile: data,
        subscription: data.subscriptions || { status: 'free', draft_count: 0 },
        loading: false
      }));
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        error: `Data error: ${err.message}`,
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));

        // Check guest session
        const guestSession = getGuestSession();
        if (guestSession.id && !authState.user) {
          setAuthState({
            user: {
              id: guestSession.id,
              isGuest: true,
              createdAt: guestSession.createdAt
            },
            profile: null,
            subscription: null,
            loading: false,
            error: null,
            isGuest: true
          });
          return;
        }

        // Get authenticated session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            isGuest: false
          }));
          await fetchUserData(session.user.id);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        setAuthState(prev => ({
          ...prev,
          error: err.message,
          loading: false
        }));
      }
    };

    initAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            isGuest: false
          }));
          await fetchUserData(session.user.id);
        } else {
          setAuthState({
            user: null,
            profile: null,
            subscription: null,
            loading: false,
            error: null,
            isGuest: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const startGuestSession = () => {
    const session = getGuestSession();
    setAuthState({
      user: {
        id: session.id,
        isGuest: true,
        createdAt: session.createdAt
      },
      profile: null,
      subscription: null,
      loading: false,
      error: null,
      isGuest: true
    });
  };

  const signOut = async () => {
    if (authState.user?.isGuest) {
      clearGuestSession();
    } else {
      await supabase.auth.signOut();
    }
    setAuthState({
      user: null,
      profile: null,
      subscription: null,
      loading: false,
      error: null,
      isGuest: false
    });
  };

  const value = {
    ...authState,
    startGuestSession,
    signOut,
    resetError: () => setAuthState(prev => ({ ...prev, error: null }))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}