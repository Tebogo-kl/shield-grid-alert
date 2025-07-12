
import React, { useState, useEffect } from 'react';
import { MapPin, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Officer {
  id: string;
  badge_number: string;
  hourly_rate: number;
  rating: number;
  total_jobs: number;
  specializations: string[];
  status: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  companies: {
    company_name: string;
  };
  location: { lat: number; lng: number };
}

interface SecurityMapProps {
  userLocation: { lat: number; lng: number };
  selectedService: string;
}

const SecurityMap: React.FC<SecurityMapProps> = ({ userLocation, selectedService }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableOfficers();
  }, [selectedService]);

  const fetchAvailableOfficers = async () => {
    try {
      const { data: officersData, error } = await supabase
        .from('security_officers')
        .select(`
          *,
          profiles:user_id (first_name, last_name),
          companies:company_id (company_name)
        `)
        .eq('status', 'available')
        .limit(10);

      if (error) {
        console.error('Error fetching officers:', error);
        setOfficers([]);
        setLoading(false);
        return;
      }

      // Format the officers data with simulated locations
      const formattedOfficers = (officersData || []).map((officer, index) => ({
        ...officer,
        location: { 
          lat: userLocation.lat + (Math.random() - 0.5) * 0.01, 
          lng: userLocation.lng + (Math.random() - 0.5) * 0.01 
        }
      }));

      setOfficers(formattedOfficers);
    } catch (error) {
      console.error('Error fetching available officers:', error);
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'responding': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-600">Loading officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-white/90 text-gray-800">
          <MapPin className="h-3 w-3 mr-1" />
          Security Grid View
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 rounded-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available ({officers.filter(o => o.status === 'available').length})</span>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="absolute inset-0 p-8">
        {/* User Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-700 whitespace-nowrap">
              You
            </div>
          </div>
        </div>

        {/* Security Officers */}
        {officers.map((officer, index) => {
          const angle = (index * 360) / Math.max(officers.length, 1);
          const radius = 60 + (index * 20);
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

          return (
            <div
              key={officer.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getStatusColor(officer.status)}`}>
                  <Shield className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                {officer.status === 'available' && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500/20 rounded-full animate-ping"></div>
                )}
                
                {/* Officer Info Tooltip */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg p-3 shadow-lg min-w-48 z-20">
                  <div className="text-sm font-medium text-gray-900">
                    {officer.profiles.first_name} {officer.profiles.last_name}
                  </div>
                  <div className="text-xs text-gray-600">{officer.companies.company_name}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {officer.specializations?.[0] || 'General Security'}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-600">${officer.hourly_rate}/hr</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(officer.status)} text-white border-0`}>
                      {officer.status}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-600 ml-1">{officer.rating}</span>
                    <span className="text-xs text-gray-500 ml-2">({officer.total_jobs} jobs)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Service Filter Indicator */}
      {selectedService && (
        <div className="absolute bottom-4 left-4 z-10 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          Showing: {selectedService.replace('_', ' ').replace('-', ' ')}
        </div>
      )}

      {/* No Officers Message */}
      {officers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-4 text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No officers available in your area</p>
            <button 
              onClick={fetchAvailableOfficers}
              className="text-xs text-blue-600 mt-2 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMap;
