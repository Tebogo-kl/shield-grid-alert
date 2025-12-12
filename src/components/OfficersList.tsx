import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Shield, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Officer {
  id: string;
  badge_number: string;
  rating: number;
  total_jobs: number;
  status: string;
  specializations: string[];
  hourly_rate: number;
  company_name?: string;
  first_name?: string;
  last_name?: string;
}

interface OfficersListProps {
  selectedService: string;
  onSelectOfficer?: (officer: Officer) => void;
}

const serviceToSpecialization: Record<string, string> = {
  'armed-response': 'armed_response',
  'personal-security': 'surveillance',
  'patrol-service': 'patrol',
  'emergency-response': 'emergency',
  'escort-service': 'escort',
  'consultation': 'surveillance'
};

const OfficersList: React.FC<OfficersListProps> = ({ selectedService, onSelectOfficer }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      if (!selectedService) {
        setOfficers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch officers with their company info
        const { data: officersData, error: officersError } = await supabase
          .from('security_officers')
          .select('*')
          .eq('status', 'available');

        if (officersError) throw officersError;

        // Fetch companies
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, company_name');

        // Fetch profiles for officer names
        const userIds = officersData?.map(o => o.user_id) || [];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const specialization = serviceToSpecialization[selectedService];
        
        // Combine and filter officers
        const combinedOfficers = (officersData || [])
          .filter(officer => {
            if (!specialization) return true;
            return officer.specializations?.includes(specialization);
          })
          .map(officer => {
            const company = companiesData?.find(c => c.id === officer.company_id);
            const profile = profilesData?.find(p => p.id === officer.user_id);
            return {
              ...officer,
              company_name: company?.company_name || 'Independent',
              first_name: profile?.first_name || 'Officer',
              last_name: profile?.last_name || officer.badge_number
            };
          });

        setOfficers(combinedOfficers);
      } catch (error) {
        console.error('Error fetching officers:', error);
        // Use mock data as fallback
        setOfficers(getMockOfficers(selectedService));
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, [selectedService]);

  const getMockOfficers = (service: string): Officer[] => {
    const mockData: Officer[] = [
      {
        id: '1',
        badge_number: 'SEC-001',
        rating: 4.8,
        total_jobs: 156,
        status: 'available',
        specializations: ['armed_response', 'emergency'],
        hourly_rate: 250,
        company_name: 'Elite Security Services',
        first_name: 'John',
        last_name: 'Mokoena'
      },
      {
        id: '2',
        badge_number: 'SEC-002',
        rating: 4.9,
        total_jobs: 203,
        status: 'available',
        specializations: ['patrol', 'surveillance'],
        hourly_rate: 180,
        company_name: 'SafeGuard Protection',
        first_name: 'Sarah',
        last_name: 'van der Berg'
      },
      {
        id: '3',
        badge_number: 'SEC-003',
        rating: 4.7,
        total_jobs: 89,
        status: 'available',
        specializations: ['escort', 'surveillance'],
        hourly_rate: 200,
        company_name: 'Premier Guards',
        first_name: 'David',
        last_name: 'Nkosi'
      },
      {
        id: '4',
        badge_number: 'SEC-004',
        rating: 4.6,
        total_jobs: 134,
        status: 'available',
        specializations: ['armed_response', 'patrol', 'emergency'],
        hourly_rate: 280,
        company_name: 'Tactical Response Unit',
        first_name: 'Michael',
        last_name: 'Botha'
      },
      {
        id: '5',
        badge_number: 'SEC-005',
        rating: 4.9,
        total_jobs: 267,
        status: 'available',
        specializations: ['escort', 'surveillance', 'patrol'],
        hourly_rate: 220,
        company_name: 'VIP Protection Services',
        first_name: 'Thandi',
        last_name: 'Dlamini'
      }
    ];

    const specialization = serviceToSpecialization[service];
    return mockData.filter(officer => 
      !specialization || officer.specializations.includes(specialization)
    );
  };

  const getServiceName = (service: string) => {
    const names: Record<string, string> = {
      'armed-response': 'Armed Response',
      'personal-security': 'Personal Security',
      'patrol-service': 'Patrol Service',
      'emergency-response': 'Emergency Response',
      'escort-service': 'Escort Service',
      'consultation': 'Security Consultation'
    };
    return names[service] || service;
  };

  if (!selectedService) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
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
          <Badge className="bg-blue-500/20 text-blue-400">
            {officers.length} Available
          </Badge>
        </div>

        {officers.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No officers available for this service at the moment.</p>
            <p className="text-sm mt-1">Please try again later or select a different service.</p>
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
                      {officer.first_name?.[0]}{officer.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">
                        {officer.first_name} {officer.last_name}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{officer.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-white/70">{officer.company_name}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {officer.badge_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {officer.total_jobs || 0} jobs
                      </span>
                      <span className="text-green-400 font-medium">
                        R{officer.hourly_rate || 150}/hr
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => onSelectOfficer?.(officer)}
                      >
                        Request Officer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs border-white/20 text-white hover:bg-white/10"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
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
