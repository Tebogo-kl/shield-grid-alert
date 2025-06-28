import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Clock, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SecurityMap from '@/components/SecurityMap';
import ServiceSelector from '@/components/ServiceSelector';
import OfficerCard from '@/components/OfficerCard';
import EmergencyButton from '@/components/EmergencyButton';

interface Officer {
  id: number;
  name: string;
  company: string;
  rating: number;
  distance: string;
  estimatedArrival: string;
  specialization: string;
  status: string;
  location: { lat: number; lng: number };
  profileImage: string;
  yearsExperience: number;
  completedJobs: number;
  responseTime: string;
}

const Index = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [showOfficers, setShowOfficers] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: -26.2041, lng: 28.0473 });
  const [nearbyOfficers, setNearbyOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("Using default location");
        }
      );
    }
  }, []);

  const fetchNearbyOfficers = async () => {
    try {
      setLoading(true);
      
      const { data: officersData, error } = await supabase
        .from('security_officers')
        .select(`
          id,
          badge_number,
          status,
          rating,
          total_jobs,
          current_latitude,
          current_longitude,
          specializations,
          user_id,
          company_id
        `)
        .eq('status', 'available');

      if (error) {
        console.error('Error fetching officers:', error);
        return;
      }

      if (!officersData || officersData.length === 0) {
        setNearbyOfficers([]);
        return;
      }

      // Get profiles for these officers
      const userIds = officersData.map(officer => officer.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get companies for these officers
      const companyIds = officersData.map(officer => officer.company_id);
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name')
        .in('id', companyIds);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        return;
      }

      const formattedOfficers: Officer[] = officersData.map((officer, index) => {
        const profile = profilesData?.find(p => p.id === officer.user_id);
        const company = companiesData?.find(c => c.id === officer.company_id);
        
        return {
          id: parseInt(officer.id),
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Officer',
          company: company?.company_name || 'Unknown Company',
          rating: officer.rating || 4.5,
          distance: "0.5 km", // Would calculate based on location
          estimatedArrival: "3-5 mins",
          specialization: officer.specializations?.[0] || "General Security",
          status: officer.status,
          location: { 
            lat: officer.current_latitude || (userLocation.lat + (Math.random() - 0.5) * 0.01), 
            lng: officer.current_longitude || (userLocation.lng + (Math.random() - 0.5) * 0.01)
          },
          profileImage: "/api/placeholder/100/100",
          yearsExperience: Math.floor(Math.random() * 10) + 1,
          completedJobs: officer.total_jobs || 0,
          responseTime: "2.4 mins avg"
        };
      });

      setNearbyOfficers(formattedOfficers);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowOfficers(true);
    fetchNearbyOfficers();
  };

  const handleRequestOfficer = async (officerId: number) => {
    if (!user) {
      alert('Please log in to request an officer');
      return;
    }

    try {
      const officer = nearbyOfficers.find(o => o.id === officerId);
      if (!officer) return;

      // Create service request
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          service_type: selectedService as any,
          description: `Requested ${officer.specialization} service`,
          location_address: 'Current Location', // Would get from geolocation
          location_latitude: userLocation.lat,
          location_longitude: userLocation.lng,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service request:', error);
        alert('Failed to create service request');
        return;
      }

      alert(`Service request created! Request ID: ${data.id.slice(0, 8)}...`);
    } catch (error) {
      console.error('Error requesting officer:', error);
      alert('Failed to request officer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">SecureCall</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Johannesburg, GP</span>
              </div>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                {user ? 'Profile' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Services and Officers */}
          <div className="space-y-6">
            {/* Emergency Button */}
            <EmergencyButton />

            {/* Service Selection */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Select Security Service</h2>
                <ServiceSelector onServiceSelect={handleServiceSelect} selectedService={selectedService} />
              </div>
            </Card>

            {/* Nearby Officers */}
            {showOfficers && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Nearby Officers</h2>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      {nearbyOfficers.filter(o => o.status === 'available').length} Available
                    </Badge>
                  </div>
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-white/70">Loading available officers...</p>
                    </div>
                  ) : nearbyOfficers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/70">No officers available at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nearbyOfficers.map((officer) => (
                        <OfficerCard
                          key={officer.id}
                          officer={officer}
                          onRequest={() => handleRequestOfficer(officer.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-white/80">Available</div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">2.3min</div>
                <div className="text-sm text-white/80">Avg Response</div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">4.8★</div>
                <div className="text-sm text-white/80">Rating</div>
              </Card>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:sticky lg:top-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
              <SecurityMap 
                officers={nearbyOfficers} 
                userLocation={userLocation}
                selectedService={selectedService}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
