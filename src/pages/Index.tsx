import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, MapPin, Clock, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ServiceSelector from '@/components/ServiceSelector';
import OfficersList from '@/components/OfficersList';
import SecurityMap from '@/components/SecurityMap';
import EmergencyButton from '@/components/EmergencyButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedService, setSelectedService] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: -26.2041, lng: 28.0473 });
  const [locationName, setLocationName] = useState('Johannesburg, South Africa');
  const { user, userProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('=== Auth State Debug ===');
    console.log('Loading:', loading);
    console.log('User:', user);
    console.log('UserProfile:', userProfile);
    console.log('Token:', localStorage.getItem('authToken'));
    console.log('Stored User:', localStorage.getItem('user'));
    console.log('=====================');
  }, [user, userProfile, loading]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  const handleDashboardNavigation = () => {
    if (userProfile?.role === 'CompanyAdmin') {
      navigate('/company-dashboard');
    } else if (userProfile?.role === 'SecurityOfficer') {
      navigate('/officer-dashboard');
    } else {
      // Regular user stays on this page
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'User';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">SecureGuard</h1>
              <p className="text-xs text-white/70">On-Demand Security Services</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={userProfile?.avatarUrl || userProfile?.avatar_url} 
                        alt={getUserDisplayName()} 
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {userProfile?.role && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {userProfile.role.toString().replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userProfile?.role !== 0 && userProfile?.role !== 'user' && (
                    <>
                      <DropdownMenuItem onClick={handleDashboardNavigation} className="cursor-pointer">
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Change Profile Image
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    View Profile Info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-500">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Location Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-white/70 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{locationName}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Security Services</h2>
          <p className="text-white/70">Choose from our range of professional security services available 24/7</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Selection */}
          <div className="lg:col-span-1 space-y-6">
            <ServiceSelector onServiceSelect={handleServiceSelect} selectedService={selectedService} />
            
            {/* Officers List - appears when service is selected */}
            {selectedService && (
              <OfficersList 
                selectedService={selectedService}
                onSelectOfficer={(officer) => console.log('Selected officer:', officer)}
              />
            )}
            
            {/* Emergency Button */}
            <Card className="bg-red-600/20 border-red-500/50">
              <CardContent className="p-4">
                <EmergencyButton />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Service Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Available Officers</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">24</Badge>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Avg Response Time</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400">8 min</Badge>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Service Rating</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400">4.8/5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Available Officers Near You</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityMap 
                  userLocation={userLocation}
                  selectedService={selectedService}
                />
              </CardContent>
            </Card>

            {/* Request Button */}
            {selectedService && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  disabled={!user}
                >
                  {user ? (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Request {selectedService.replace('_', ' ')} Service
                    </>
                  ) : (
                    'Sign in to request services'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Service Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Professional Officers</h3>
              <p className="text-white/70 text-sm">Trained and certified security professionals ready to serve</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Fast Response</h3>
              <p className="text-white/70 text-sm">Average response time under 10 minutes in urban areas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">GPS Tracking</h3>
              <p className="text-white/70 text-sm">Real-time officer location and arrival updates</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;