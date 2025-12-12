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

interface SecurityOfficer {
  id: string;
  userId?: string;
  companyId?: string;
  badgeNumber?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
  specializations?: string[];
  isPsiraVerified?: boolean;
  psiraCertificateExpiry?: string; 
  psiraNumber?: string;
  psiraStatus?: string;
  createdAt?: string;
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
  securityOfficer: SecurityOfficer | null;
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
  const [securityOfficer, setSecurityOfficer] = useState<SecurityOfficer | null>(null);
  const [securityOfficerSession, setSecurityOfficerSession] = useState<Session | null>(null);
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

  const fetchSecurityOfficer = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/securityofficers/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.log('No security officer found for this user');
        setSecurityOfficer(null);
        return null;
      }

      const officer = await response.json();
      console.log('Fetched security officer:', officer);
      setSecurityOfficer(officer);
      localStorage.setItem('securityOfficer', JSON.stringify(officer));
      return officer;

    } catch (error) {
      console.error('Error fetching security officer:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      const officerStr = localStorage.getItem('securityOfficer');
      const officerToken = localStorage.getItem('securityOfficerToken');
      const officerExpiresAt = localStorage.getItem('securityOfficerTokenExpiresAt');

      // Restore security officer from localStorage
      if (officerStr) {
        try {
          const officerData = JSON.parse(officerStr);
          console.log('Restored security officer from storage:', officerData);
          setSecurityOfficer(officerData);
          
          if (officerToken) {
            if (officerExpiresAt && Date.now() > parseInt(officerExpiresAt)) {
              localStorage.removeItem('securityOfficer');
              localStorage.removeItem('securityOfficerToken');
              localStorage.removeItem('securityOfficerTokenExpiresAt');
            } else {
              setSecurityOfficerSession({
                user: officerData,
                accessToken: officerToken,
                expiresIn: officerExpiresAt ? parseInt(officerExpiresAt) - Date.now() : 3600000,
                expiresAt: officerExpiresAt ? parseInt(officerExpiresAt) : Date.now() + 3600000,
              });
            }
          }
        } catch (err) {
          console.error('Error restoring security officer:', err);
        }
      }

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const expiresAt = localStorage.getItem('tokenExpiresAt');

          if (expiresAt && Date.now() > parseInt(expiresAt)) {
            // Token expired, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiresAt');
            localStorage.removeItem('securityOfficer');
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

          await fetchUserProfile(userData.id);
          
          // Only fetch security officer if not already restored from storage
          if (!officerStr) {
            await fetchSecurityOfficer(userData.id);
          }

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
      const userData = data.profiles || data.Profiles;
      const expiresIn = data.expiresIn || data.ExpiresIn || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

      setUser(userData);
      setSession({
        user: userData,
        accessToken: token,
        expiresIn: expiresIn,
        expiresAt,
      });

      await fetchUserProfile(userData.id);
      await fetchSecurityOfficer(userData.id);

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

      // FIXED: Send 'fullName' instead of 'name' to match API's OfficerLoginDto
      const response = await fetch(`${API_BASE_URL}/profiles/officer-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fullName: name,  // API expects 'fullName', not 'name'
          badgeNumber 
        })
      });

      const data = await response.json();
      console.log('Officer signin response:', data);

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Invalid badge number or name';
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: { message: errorMessage } };
      }

      // FIXED: Extract data correctly from the response
      // Response structure: { token, profiles, securityOfficer, expiresIn }
      const token = data.token || data.Token;
      const userData = data.profiles || data.Profiles;  // Profile data is in 'profiles'
      const officerData = data.securityOfficer || data.SecurityOfficer;
      const expiresIn = data.expiresIn || data.ExpiresIn || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      console.log('Parsed officer login data:', {
        token: token ? 'present' : 'missing',
        userData,
        officerData,
        expiresIn
      });

      // Validate we have required data
      if (!token || !userData) {
        console.error('Missing token or user data in response');
        toast({
          title: "Login Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
        return { error: { message: "Invalid response from server" } };
      }

      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

      // Store security officer data if present
      if (officerData) {
        localStorage.setItem('securityOfficer', JSON.stringify(officerData));
        setSecurityOfficer(officerData);
        console.log('Security officer set:', officerData);
      } else {
        console.warn('No security officer data in response, will fetch separately');
        // Fetch officer data if not included in response
        await fetchSecurityOfficer(userData.id);
      }

      setUser(userData);
      setSession({
        user: userData,
        accessToken: token,
        expiresIn: expiresIn,
        expiresAt,
      });
      setUserProfile(userData);

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

      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('securityOfficer');
      localStorage.removeItem('securityOfficerToken');
      localStorage.removeItem('securityOfficerTokenExpiresAt');

      setUser(null);
      setSession(null);
      setUserProfile(null);
      setSecurityOfficer(null);
      setSecurityOfficerSession(null);

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
    securityOfficer,
    securityOfficerSession,
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