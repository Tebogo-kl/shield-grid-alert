
import React from 'react';
import { MapPin, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

interface SecurityMapProps {
  officers: Officer[];
  userLocation: { lat: number; lng: number };
  selectedService: string;
}

const SecurityMap: React.FC<SecurityMapProps> = ({ officers, userLocation, selectedService }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'responding': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Responding</span>
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
          const angle = (index * 360) / officers.length;
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
                  <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                  <div className="text-xs text-gray-600">{officer.company}</div>
                  <div className="text-xs text-blue-600 mt-1">{officer.specialization}</div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-600">{officer.distance}</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(officer.status)} text-white border-0`}>
                      {officer.status}
                    </Badge>
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
          Showing: {selectedService}
        </div>
      )}
    </div>
  );
};

export default SecurityMap;
