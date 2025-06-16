
import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Clock, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SecurityMap from '@/components/SecurityMap';
import ServiceSelector from '@/components/ServiceSelector';
import OfficerCard from '@/components/OfficerCard';
import EmergencyButton from '@/components/EmergencyButton';

// Mock data for nearby security officers
const nearbyOfficers = [
  {
    id: 1,
    name: "Marcus Johnson",
    company: "SecureGuard Solutions",
    rating: 4.9,
    distance: "0.3 km",
    estimatedArrival: "3-5 mins",
    specialization: "Armed Response",
    status: "available",
    location: { lat: -26.2041, lng: 28.0473 },
    profileImage: "/api/placeholder/100/100",
    yearsExperience: 8,
    completedJobs: 1247,
    responseTime: "2.4 mins avg"
  },
  {
    id: 2,
    name: "Sarah Williams",
    company: "Elite Protection Services",
    rating: 4.8,
    distance: "0.7 km",
    estimatedArrival: "5-8 mins",
    specialization: "Personal Security",
    status: "available",
    location: { lat: -26.2051, lng: 28.0483 },
    profileImage: "/api/placeholder/100/100",
    yearsExperience: 6,
    completedJobs: 892,
    responseTime: "3.1 mins avg"
  },
  {
    id: 3,
    name: "David Chen",
    company: "Rapid Response Security",
    rating: 4.7,
    distance: "1.2 km",
    estimatedArrival: "6-10 mins",
    specialization: "Emergency Response",
    status: "responding",
    location: { lat: -26.2061, lng: 28.0463 },
    profileImage: "/api/placeholder/100/100",
    yearsExperience: 12,
    completedJobs: 2103,
    responseTime: "1.8 mins avg"
  }
];

const Index = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [showOfficers, setShowOfficers] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: -26.2041, lng: 28.0473 });

  useEffect(() => {
    // Simulate getting user location
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

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowOfficers(true);
  };

  const handleRequestOfficer = (officerId: number) => {
    const officer = nearbyOfficers.find(o => o.id === officerId);
    if (officer) {
      alert(`Requesting ${officer.name} from ${officer.company}. Estimated arrival: ${officer.estimatedArrival}`);
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
                Profile
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
                  <div className="space-y-4">
                    {nearbyOfficers.map((officer) => (
                      <OfficerCard
                        key={officer.id}
                        officer={officer}
                        onRequest={() => handleRequestOfficer(officer.id)}
                      />
                    ))}
                  </div>
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
