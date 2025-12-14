import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle, Phone, User, ChevronDown, ChevronUp, Mail, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ServiceRequest {
  id: string;
  userId: string;
  serviceType: string;
  description: string;
  locationAddress: string;
  locationLatitude: number;
  locationLongitude: number;
  status: string;
  createdAt: string;
  userProfile?: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
  };
}

interface RequestDetailCardProps {
  request: ServiceRequest;
  onAccept: (requestId: string) => void;
  disabled: boolean;
  getServiceTypeColor: (type: string) => string;
  formatServiceType: (type: string) => string;
}

const RequestDetailCard: React.FC<RequestDetailCardProps> = ({
  request,
  onAccept,
  disabled,
  getServiceTypeColor,
  formatServiceType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getServiceTypeColor(request.serviceType)}>
                    {formatServiceType(request.serviceType)}
                  </Badge>
                  <span className="text-white/70 text-sm">
                    {new Date(request.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{request.locationAddress}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(request.id);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={disabled}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-white/50" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white/50" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
            {/* Map Section */}
            <div className="relative h-64 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-lg overflow-hidden border border-white/10">
              {/* Map Header */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-white/90 text-gray-800">
                  <MapPin className="h-3 w-3 mr-1" />
                  Request Location
                </Badge>
              </div>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid-officer" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-officer)" />
                </svg>
              </div>

              {/* Location Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-10 h-10 bg-red-500/30 rounded-full animate-pulse"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-800 whitespace-nowrap">
                    Client Location
                  </div>
                </div>
              </div>

              {/* Coordinates Display */}
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-3 w-3" />
                  <span>
                    {request.locationLatitude.toFixed(4)}, {request.locationLongitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Open in Maps Button */}
              <div className="absolute bottom-3 left-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${request.locationLatitude},${request.locationLongitude}`,
                      '_blank'
                    );
                  }}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Open in Maps
                </Button>
              </div>
            </div>

            {/* User Information Section */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Client Information
              </h4>
              
              {request.userProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {request.userProfile.firstName} {request.userProfile.lastName}
                        </p>
                        <p className="text-white/50 text-xs">Client</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-white/80">
                      <Phone className="h-4 w-4 text-green-400" />
                      <a 
                        href={`tel:${request.userProfile.phone}`}
                        className="hover:text-green-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {request.userProfile.phone}
                      </a>
                    </div>

                    {request.userProfile.email && (
                      <div className="flex items-center space-x-2 text-white/80">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span>{request.userProfile.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-white/80">
                      <MapPin className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">{request.locationAddress}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-white/80">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">
                        Requested: {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">No client information available</p>
              )}

              {request.description && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/70 text-sm">
                    <span className="font-medium text-white">Description: </span>
                    {request.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (request.userProfile?.phone) {
                    window.open(`tel:${request.userProfile.phone}`);
                  }
                }}
                disabled={!request.userProfile?.phone}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Client
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(request.id);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={disabled}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Request
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default RequestDetailCard;
