
import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">SecureCall</h1>
              <p className="text-white/70">Welcome back!</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white/80">
              <p><strong>Name:</strong> {userProfile?.first_name} {userProfile?.last_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              {userProfile?.phone && <p><strong>Phone:</strong> {userProfile.phone}</p>}
              {userProfile?.address && <p><strong>Address:</strong> {userProfile.address}</p>}
              <p><strong>Role:</strong> {userProfile?.role || 'user'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to SecureCall</h2>
            <p className="text-white/70">
              Your secure authentication system is working perfectly! You are now logged in and can access protected areas of the application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
