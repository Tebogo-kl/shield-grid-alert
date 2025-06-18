
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  officerSignIn: (name: string, badgeNumber: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {}
        }
      });

      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const officerSignIn = async (name: string, badgeNumber: string) => {
    try {
      // First, find the security officer by badge number
      const { data: officer, error: officerError } = await supabase
        .from('security_officers')
        .select('*, profiles!security_officers_user_id_fkey(*)')
        .eq('badge_number', badgeNumber)
        .single();

      if (officerError || !officer) {
        const error = new Error('Invalid badge number');
        toast({
          title: "Login Error",
          description: "Invalid badge number",
          variant: "destructive",
        });
        return { error };
      }

      // Check if the name matches (case insensitive)
      const officerName = `${officer.profiles.first_name} ${officer.profiles.last_name}`.toLowerCase();
      const providedName = name.toLowerCase().trim();
      
      if (!officerName.includes(providedName) && !providedName.includes(officer.profiles.first_name.toLowerCase())) {
        const error = new Error('Invalid name or badge number');
        toast({
          title: "Login Error",
          description: "Invalid name or badge number",
          variant: "destructive",
        });
        return { error };
      }

      // Create a temporary session for the officer
      const officerUser = {
        id: officer.user_id,
        email: `officer_${officer.badge_number}@temp.com`,
        user_metadata: {
          first_name: officer.profiles.first_name,
          last_name: officer.profiles.last_name,
          badge_number: officer.badge_number,
          role: 'security_officer'
        }
      };

      // Set session manually for officer
      setUser(officerUser as any);
      setSession({
        user: officerUser as any,
        access_token: 'temp_officer_token',
        refresh_token: 'temp_refresh_token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer'
      } as any);

      toast({
        title: "Welcome!",
        description: `Logged in as ${officer.profiles.first_name} ${officer.profiles.last_name}`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    officerSignIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
