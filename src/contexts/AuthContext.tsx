import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileSetupRequired: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkProfileCompletion: (userId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);

  const checkProfileCompletion = async (userId?: string): Promise<boolean> => {
    const currentUserId = userId || user?.id;
    if (!currentUserId) {
      setProfileSetupRequired(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_setup_completed, first_name, last_name, profession, selected_neighborhood_id')
        .eq('id', currentUserId)
        .single();

      if (error || !data) {
        setProfileSetupRequired(true);
        return false;
      }

      // Check if profile setup is complete - minimum required: name, profession, neighborhood
      const isComplete = Boolean(data.profile_setup_completed) || Boolean(
        data.first_name && 
        data.first_name.trim() !== '' &&
        data.last_name && 
        data.last_name.trim() !== '' &&
        data.profession && 
        data.profession.trim() !== '' &&
        data.selected_neighborhood_id
      );

      setProfileSetupRequired(!isComplete);
      return isComplete;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setProfileSetupRequired(true);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile creation and completion check to avoid blocking auth flow
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            await createUserProfile(session.user);
            await checkProfileCompletion(session.user.id);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkProfileCompletion(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkProfileCompletion]);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile from user metadata
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            avatar_url: user.user_metadata?.avatar_url || null,
          });

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };


  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    profileSetupRequired,
    signUp,
    signIn,
    signOut,
    checkProfileCompletion
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};