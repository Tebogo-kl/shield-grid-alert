import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: number;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    badgeNumber?: string;
    role?: string;
  };
}

interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: any;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  officerSignIn: (name: string, badgeNumber: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL - Update this to match your .NET API
const API_BASE_URL = 'https://localhost:44339/api';

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile from your .NET API
  const fetchUserProfile = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching profile:', response.statusText);
        return null;
      }

      const profile = await response.json();
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const expiresAt = localStorage.getItem('tokenExpiresAt');

          if (expiresAt && Date.now() > parseInt(expiresAt)) {
            // Token expired, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiresAt');
            setLoading(false);
            return;
          }

          setUser(userData);
          setSession({
            user: userData,
            accessToken: token,
            expiresIn: expiresAt ? parseInt(expiresAt) - Date.now() : 3600000,
            expiresAt: expiresAt ? parseInt(expiresAt) : Date.now() + 3600000,
          });

          // Use userData.id instead of user.id since state hasn't updated yet
          await fetchUserProfile(userData.id);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const requestBody = {
        email,
        password,
        firstName: metadata?.firstName || null,
        lastName: metadata?.lastName || null,
        phone: metadata?.phone || null,
        address: metadata?.address || null,
        role: metadata?.role || 0
      };

      console.log('Attempting signup with:', { email, ...metadata });

      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Signup response:', { status: response.status, data });

      if (!response.ok) {
        toast({
          title: "Signup Error",
          description: data.message || data.error || 'Signup failed',
          variant: "destructive",
        });
        return { error: data };
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully!",
        });
        return { data, error: null };
      }
    } catch (error: any) {
      console.error('Network/fetch error:', error);
      toast({
        title: "Network Error",
        description: "Failed to connect to authentication service. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin with:', email);

      const response = await fetch(`${API_BASE_URL}/profiles/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server returned invalid response format. Check server logs.');
      }
    console.log('Full signin response data:', JSON.stringify(data, null, 2));
    console.log('Token:', data.token || data.Token);
    console.log('Profiles:', data.Profiles || data.profiles);
    console.log('ExpiresIn:', data.expiresIn || data.ExpiresIn);
    console.log('Signin response:', { status: response.status, data });
      

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Login failed';
        toast({
          title: "Login Error",
          description: typeof errorMessage === 'string' ? errorMessage : errorMessage.message,
          variant: "destructive",
        });
        return { error: { message: errorMessage } };
      }

const token = data.token || data.Token;
const userData = data.profiles || data.Profiles;  // ← lowercase 'p' first!
const expiresIn = data.expiresIn || data.ExpiresIn || 3600;     


const expiresAt = Date.now() + (expiresIn || 3600) * 1000;//

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresIn.toString());

      setUser(userData);
      setSession({
        user:userData,
        accessToken: token,
        expiresIn: expiresIn || 3600,
        expiresAt,
      });

     fetchUserProfile(userData.id);
  

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.email}`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Error", 
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return { error };
    }

    
  };


  const officerSignIn = async (name: string, badgeNumber: string) => {
    try {
      console.log('Attempting officer signin with:', { name, badgeNumber });

      const response = await fetch(`${API_BASE_URL}/profiles/officer-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
        name,
        badgeNumber })
      });

      const data = await response.json();
      console.log('Officer signin response:', { status: response.status, data });

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Invalid badge number or name';
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: { message: errorMessage } };
      }

      const { token, user: userData, profiles, expiresIn } = data;
      const expiresAt = Date.now() + (expiresIn || 3600) * 1000;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

      setUser(userData);
      setSession({
        user: userData,
        accessToken: token,
        expiresIn: expiresIn || 3600,
        expiresAt,
      });

      if (profiles) {
        setUserProfile(profiles);
      } else {
        await fetchUserProfile(userData.id);
      }
      

      toast({
        title: "Welcome!",
        description: `Logged in as Officer ${badgeNumber}`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Officer login error:', error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Logout endpoint error:', error);
        }
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('refreshToken');

      setUser(null);
      setSession(null);
      setUserProfile(null);
      
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
    userProfile,
    loading,
    signUp,
    signIn,
    officerSignIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};