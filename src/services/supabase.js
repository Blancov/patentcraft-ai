import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and ANON_KEY must be defined in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to handle database errors
const handleDbError = (error, context) => {
  console.error(`Database error [${context}]:`, error);
  return { error };
};

// Auth functions
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          created_at: new Date().toISOString()
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) return { error };

    // Create profile record
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          email: data.user.email,
          plan: 'free',
          draft_count: 0,
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }
    
    return { data };
  } catch (error) {
    return handleDbError(error, 'signUp');
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (error) {
    return handleDbError(error, 'signIn');
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    return { data, error };
  } catch (error) {
    return handleDbError(error, 'signInWithGoogle');
  }
};

export const signInWithGitHub = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'user:email'
      }
    });
    return { data, error };
  } catch (error) {
    return handleDbError(error, 'signInWithGitHub');
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return handleDbError(error, 'signOut');
  }
};

export const getCurrentUser = async () => {
  try {
    return await supabase.auth.getUser();
  } catch (error) {
    return handleDbError(error, 'getCurrentUser');
  }
};

export const updateProfile = async (updates) => {
  try {
    // Update auth metadata
    const { data: authData, error: authError } = 
      await supabase.auth.updateUser(updates);
    
    if (authError) return { error: authError };
    
    // Update profile table
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates.data)
      .eq('id', authData.user.id);
    
    return { data: authData, error: profileError };
  } catch (error) {
    return handleDbError(error, 'updateProfile');
  }
};

// Profile management
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    return handleDbError(error, 'getUserProfile');
  }
};

// Subscription management
export const getSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    return handleDbError(error, 'getSubscription');
  }
};

// Team management
export const createTeam = async (teamName, ownerId) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: teamName, owner_id: ownerId }])
      .select()
      .single();
    
    if (error) return { error };
    
    // Add owner to team_members
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ team_id: data.id, user_id: ownerId, role: 'owner' }]);
    
    return { data, error: memberError };
  } catch (error) {
    return handleDbError(error, 'createTeam');
  }
};

// Listen for auth state changes - only log event
supabase.auth.onAuthStateChange((event) => {
  console.log('Auth event:', event);
});