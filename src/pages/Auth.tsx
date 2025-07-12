
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UserLoginForm from '@/components/auth/UserLoginForm';
import UserSignupForm from '@/components/auth/UserSignupForm';
import CompanyLoginForm from '@/components/auth/CompanyLoginForm';
import CompanySignupForm from '@/components/auth/CompanySignupForm';
import OfficerLoginForm from '@/components/auth/OfficerLoginForm';

type AuthMode = 'select' | 'user-login' | 'user-signup' | 'company-login' | 'company-signup' | 'officer-login';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('select');
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default paths
  const getRedirectPath = () => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth') return from;
    
    if (userProfile?.role === 'company_admin') return '/company-dashboard';
    if (userProfile?.role === 'security_officer') return '/officer-dashboard';
    return '/home';
  };

  // Redirect authenticated users
  useEffect(() => {
    if (user && userProfile && !loading) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [user, userProfile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user && userProfile) {
    return null; // Will redirect
  }

  const renderContent = () => {
    switch (mode) {
      case 'user-login':
        return <UserLoginForm onBack={() => setMode('select')} onSignup={() => setMode('user-signup')} />;
      case 'user-signup':
        return <UserSignupForm onBack={() => setMode('select')} onLogin={() => setMode('user-login')} />;
      case 'company-login':
        return <CompanyLoginForm onBack={() => setMode('select')} onSignup={() => setMode('company-signup')} />;
      case 'company-signup':
        return <CompanySignupForm onBack={() => setMode('select')} onLogin={() => setMode('company-login')} />;
      case 'officer-login':
        return <OfficerLoginForm onBack={() => setMode('select')} />;
      default:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-400 mr-3" />
                <h1 className="text-3xl font-bold text-white">SecureCall</h1>
              </div>
              <p className="text-white/70">Choose your account type to get started</p>
            </div>

            <div className="grid gap-4">
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white/10 border-white/20 hover:bg-white/20"
                onClick={() => setMode('user-login')}
              >
                <div className="p-6 text-center">
                  <User className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">User Account</h3>
                  <p className="text-white/70 text-sm">Request security services on-demand</p>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                    Continue as User
                  </Button>
                </div>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white/10 border-white/20 hover:bg-white/20"
                onClick={() => setMode('company-login')}
              >
                <div className="p-6 text-center">
                  <Building className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Security Company</h3>
                  <p className="text-white/70 text-sm">Manage officers and provide security services</p>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Continue as Company
                  </Button>
                </div>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-white/10 border-white/20 hover:bg-white/20"
                onClick={() => setMode('officer-login')}
              >
                <div className="p-6 text-center">
                  <Shield className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Security Officer</h3>
                  <p className="text-white/70 text-sm">Access your officer dashboard</p>
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                    Officer Login
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="p-8">
            {renderContent()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
