
import React, { createContext, useContext, useEffect, useState } from 'react';
// import { User, Session } from '@supabase/supabase-js';
// import { supabase } from '@/integrations/supabase/client';
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
    first_name?: string;
    last_name?: string;
    badge_number?: string;
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

interface Company {
  id: string;
  companyName: string;
  email: string;
  phone: string;
}

interface CreateCompanyDto {
  companyName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  contactTitle: string;
}
 interface ServiceRequest {
  id: string;
  serviceType: ServiceType;
  locationAddress: string;
  status: RequestStatus;
  totalCost?: number;
  createdAt: string;
}
 interface CreateServiceRequestDto {
  serviceType: ServiceType;
  locationLatitude: number;
  locationLongitude: number;
  locationAddress: string;
  description: string;
  estimatedDuration: number;
}
 enum ServiceType {
  ArmedResponse = "ArmedResponse",
  Patrol = "Patrol",
  Escort = "Escort",
  Emergency = "Emergency",
  Surveillance = "Surveillance"
}

 enum RequestStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled"
}

interface AuthContextType {
  user: User | null;
  Profiles: User | null;
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
  const [Profiles, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

   // Fetch user profile from your .NET API
  const fetchUserProfile = async (userId: string) => {
    try {

       const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/profiles${userId}`, {
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
    if (Profiles) {
      await fetchUserProfile(Profiles.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

        
        if  (token && userStr) {
           try {
          const user = JSON.parse(userStr);
          const expiresAt = localStorage.getItem('tokenExpiresAt');

           if (expiresAt && Date.now() > parseInt(expiresAt)) {
            // Token expired, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiresAt');
            setLoading(false);
            return;
          }
    
  setUser(user);
          setSession({
            user,
            accessToken: token,
            expiresIn: expiresAt ? parseInt(expiresAt) - Date.now() : 3600000,
            expiresAt: expiresAt ? parseInt(expiresAt) : Date.now() + 3600000,
          });

 await fetchUserProfile(Profiles.id);
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
    // Structure the request body according to your API schema
    const requestBody = {
      email,
      password,
      firstName: metadata?.firstName || null,
      lastName: metadata?.lastName || null,
      phone: metadata?.phone || null,
      address: metadata?.address || null,
      role: metadata?.role || 0 // Default to role 0, adjust as needed
    };

    console.log('Attempting signup with:', { email, ...metadata }); // Debug log

    const response = await fetch(`${"https://localhost:44339/api/profiles"}`, { // Replace with your actual endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Signup response:', { status: response.status, data }); // Debug log

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

      const response = await fetch(`${"https://localhost:44339/api/profiles/login"}`, {
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



      // const data = await response.json();
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

      const { token, Profiles: userData, expiresIn } = data;
      const expiresAt = Date.now() + (expiresIn || 3600) * 1000;


      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

       setUser(userData);
      setSession({
        user:userData,
        accessToken: token,
        expiresIn: expiresIn || 3600,
        expiresAt,
      });

  await fetchUserProfile(userData.Id);

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
      // First, find the security officer by badge number
      console.log('Attempting officer signin with:', { name, badgeNumber });

      const response = await fetch(`${API_BASE_URL}/auth/officer-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, badgeNumber })
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
    
      const { token, user: userData, profile, expiresIn } = data;
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

      if (profile) {
        setUserProfile(profile);
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

      // // Get the officer's profile
      // const { data: profile, error: profileError } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', officer.user_id)
      //   .single();

      // if (profileError || !profile) {
      //   const error = new Error('Officer profile not found');
      //   toast({
      //     title: "Login Error",
      //     description: "Officer profile not found",
      //     variant: "destructive",
      //   });
      //   return { error };
      // }

      // Check if the name matches (case insensitive)
  //     const officerName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
  //     const providedName = name.toLowerCase().trim();
      
  //     if (!officerName.includes(providedName) && !providedName.includes(profile.first_name.toLowerCase())) {
  //       const error = new Error('Invalid name or badge number');
  //       toast({
  //         title: "Login Error",
  //         description: "Invalid name or badge number",
  //         variant: "destructive",
  //       });
  //       return { error };
  //     }

  //     // Create a temporary session for the officer
  //     const officerUser = {
  //       id: officer.user_id,
  //       email: `officer_${officer.badge_number}@temp.com`,
  //       user_metadata: {
  //         first_name: profile.first_name,
  //         last_name: profile.last_name,
  //         badge_number: officer.badge_number,
  //         role: 'security_officer'
  //       }
  //     };

  //     // Set session manually for officer
  //     setUser(officerUser as any);
  //     setSession({
  //       user: officerUser as any,
  //       access_token: 'temp_officer_token',
  //       refresh_token: 'temp_refresh_token',
  //       expires_in: 3600,
  //       expires_at: Date.now() + 3600000,
  //       token_type: 'bearer'
  //     } as any);

  //     setUserProfile(profile);

  //     toast({
  //       title: "Welcome!",
  //       description: `Logged in as ${profile.first_name} ${profile.last_name}`,
  //     });

  //     return { error: null };
  //   } catch (error: any) {
  //     toast({
  //       title: "Login Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //     return { error };
  //   }
  // };

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
          // Continue with local cleanup even if API call fails
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
    user: Profiles,
    Profiles,
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
