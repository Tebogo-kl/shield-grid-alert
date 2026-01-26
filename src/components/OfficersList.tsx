import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Shield, Phone, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const API_BASE_URL = 'https://localhost:44339/api';

interface Officer {
  id: string;
  odgerId: string;
  companyId: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  specializations: string[];
  currentLatitude: number | null;
  currentLongitude: number | null;
  rating: number;
  totalJobs: number;
  companyName: string;
  psiraNumber: string | null;
  isPsiraVerified: boolean;
  hourlyRate?: number;
}

interface OfficersListProps {
  selectedService: string;
  onSelectOfficer?: (officer: Officer) => void;
}

const serviceToSpecialization: Record<string, string[]> = {
  'armed-response': ['Armed Response', 'Emergency Response'],
  'armed_response': ['Armed Response', 'Emergency Response'],
  'personal-security': ['Surveillance', 'VIP Protection'],
  'patrol-service': ['Patrol', 'General Security'],
  'patrol': ['Patrol', 'General Security'],
  'emergency-response': ['Emergency Response', 'Armed Response'],
  'emergency': ['Emergency Response', 'Armed Response'],
  'escort-service': ['Escort Services', 'VIP Protection'],
  'escort': ['Escort Services', 'VIP Protection'],
  'surveillance': ['Surveillance', 'Monitoring'],
  'consultation': ['Surveillance', 'General Security']
};

const OfficersList: React.FC<OfficersListProps> = ({ selectedService, onSelectOfficer }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();
  }, [selectedService]);

  const fetchOfficers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch available officers from your .NET API
      const response = await fetch(`${API_BASE_URL}/securityofficers/available`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch officers: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched available officers:', data);

      // Filter by specialization if service is selected
      let filteredOfficers = Array.isArray(data) ? data : [];
      
      if (selectedService && filteredOfficers.length > 0) {
        const matchingSpecs = serviceToSpecialization[selectedService] || [];
        
        if (matchingSpecs.length > 0) {
          const filtered = filteredOfficers.filter((officer: Officer) => {
            // If officer has no specializations, include them
            if (!officer.specializations || officer.specializations.length === 0) {
              return true;
            }
            // Check if any specialization matches
            return officer.specializations.some(spec =>
              matchingSpecs.some(match =>
                spec.toLowerCase().includes(match.toLowerCase()) ||
                match.toLowerCase().includes(spec.toLowerCase())
              )
            );
          });
          
          // If filtering removes all officers, show all available instead
          filteredOfficers = filtered.length > 0 ? filtered : filteredOfficers;
        }
      }

      setOfficers(filteredOfficers);
    } catch (err: any) {
      console.error('Error fetching officers:', err);
      setError(err.message || 'Failed to load officers');
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (service: string) => {
    const names: Record<string, string> = {
      'armed-response': 'Armed Response',
      'armed_response': 'Armed Response',
      'personal-security': 'Personal Security',
      'patrol-service': 'Patrol Service',
      'patrol': 'Patrol Service',
      'emergency-response': 'Emergency Response',
      'emergency': 'Emergency Response',
      'escort-service': 'Escort Service',
      'escort': 'Escort Service',
      'surveillance': 'Surveillance',
      'consultation': 'Security Consultation'
    };
    return names[service] || service.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!selectedService) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Shield className="h-6 w-6 text-blue-400 animate-pulse mr-2" />
            <span className="text-white/70">Loading officers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Officers for {getServiceName(selectedService)}
          </h3>
          <div className="flex items-center space-x-2">
            <Badge className={`${officers.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {officers.length} Available
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={fetchOfficers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-8 text-white/70">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50 text-red-400" />
            <p className="text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-blue-400"
              onClick={fetchOfficers}
            >
              Try Again
            </Button>
          </div>
        ) : officers.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No officers available for this service at the moment.</p>
            <p className="text-sm mt-1">Please try again later or select a different service.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-blue-400"
              onClick={fetchOfficers}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {officer.firstName?.[0]}{officer.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">
                        {officer.firstName} {officer.lastName}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{officer.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-white/70">{officer.companyName || 'Security Company'}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {officer.badgeNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {officer.totalJobs || 0} jobs
                      </span>
                      {officer.isPsiraVerified && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs py-0">
                          PSIRA ✓
                        </Badge>
                      )}
                    </div>

                    {/* Specializations */}
                    {officer.specializations && officer.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {officer.specializations.slice(0, 3).map((spec, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs text-blue-400 border-blue-400/50 py-0"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => onSelectOfficer?.(officer)}
                      >
                        Request Officer
                      </Button>
                      {officer.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-white/20 text-white hover:bg-white/10"
                          onClick={() => window.open(`tel:${officer.phone}`)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfficersList;