
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Search } from 'lucide-react';
import ServiceSelector from '@/components/ServiceSelector';
import OfficerSelection from '@/components/OfficerSelection';
import SecurityMap from '@/components/SecurityMap';

const Index = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [showOfficerSelection, setShowOfficerSelection] = useState(false);
  const [userLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default NYC location

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowOfficerSelection(true);
  };

  const handleBackToServices = () => {
    setShowOfficerSelection(false);
    setSelectedService('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">SecureCall</h1>
        </div>
        <Button 
          onClick={signOut}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="container mx-auto px-6 pb-6">
        {!showOfficerSelection ? (
          // Service Selection View
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome, {userProfile?.first_name || 'User'}</h2>
                <p className="text-white/70">
                  Select a security service to find the right officer for your needs
                </p>
              </CardContent>
            </Card>

            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Choose Your Service
              </h3>
              <ServiceSelector 
                onServiceSelect={handleServiceSelect}
                selectedService={selectedService}
              />
            </div>

            {/* Security Map */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Available Officers in Your Area
              </h3>
              <SecurityMap 
                userLocation={userLocation}
                selectedService={selectedService}
              />
            </div>
          </div>
        ) : (
          // Officer Selection View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Select Officer</h2>
                <p className="text-white/70">Service: {selectedService.replace('_', ' ')}</p>
              </div>
              <Button 
                onClick={handleBackToServices}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Back to Services
              </Button>
            </div>
            
            <OfficerSelection 
              selectedService={selectedService}
              userLocation={userLocation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
