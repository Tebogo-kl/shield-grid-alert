
import React, { useState, useEffect } from 'react';
import { Building, Users, Plus, MapPin, Phone, Mail, Shield, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AddOfficerForm from '@/components/company/AddOfficerForm';

interface Officer {
  id: string;
  name: string;
  badge: string;
  phone: string;
  email: string;
  status: 'active' | 'off-duty' | 'on-patrol';
  location: string;
  certification: string;
  joinDate: string;
}

const CompanyDashboard = () => {
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      // Get company ID first
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (companyError || !companyData) {
        console.error('Company not found:', companyError);
        setLoading(false);
        return;
      }

      // Get officers for this company
      const { data: officersData, error: officersError } = await supabase
        .from('security_officers')
        .select('id, badge_number, status, created_at, user_id')
        .eq('company_id', companyData.id);

      if (officersError) {
        console.error('Error fetching officers:', officersError);
        setLoading(false);
        return;
      }

      if (!officersData || officersData.length === 0) {
        setOfficers([]);
        setLoading(false);
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
        setLoading(false);
        return;
      }

      // Combine the data
      const formattedOfficers = officersData.map(officer => {
        const profile = profilesData?.find(p => p.id === officer.user_id);
        
        // Map database status to interface status
        let status: 'active' | 'off-duty' | 'on-patrol' = 'off-duty';
        if (officer.status === 'available') status = 'active';
        else if (officer.status === 'busy') status = 'on-patrol';
        else status = 'off-duty';

        return {
          id: officer.id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
          badge: officer.badge_number,
          phone: profile?.phone || 'N/A',
          email: 'N/A', // We don't store email in profiles currently
          status,
          location: 'Unknown',
          certification: 'General Security',
          joinDate: new Date(officer.created_at).toLocaleDateString()
        };
      });

      setOfficers(formattedOfficers);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOfficer = async (newOfficerData: Omit<Officer, 'id'>) => {
    try {
      // Get company ID
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (companyError || !companyData) {
        console.error('Company not found:', companyError);
        return;
      }

      // Generate a new UUID for the profile
      const profileId = crypto.randomUUID();
      
      // Create profile first
      const [firstName, ...lastNameParts] = newOfficerData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          first_name: firstName,
          last_name: lastName || '',
          phone: newOfficerData.phone,
          role: 'security_officer'
        })
        .select()
        .single();

      if (profileError || !profileData) {
        console.error('Error creating profile:', profileError);
        return;
      }

      // Create security officer
      const { data: officerData, error: officerError } = await supabase
        .from('security_officers')
        .insert({
          user_id: profileData.id,
          company_id: companyData.id,
          badge_number: newOfficerData.badge,
          status: 'offline',
          specializations: [newOfficerData.certification]
        })
        .select()
        .single();

      if (officerError) {
        console.error('Error creating officer:', officerError);
        return;
      }

      // Refresh the officers list
      await fetchOfficers();
      setShowAddOfficer(false);
    } catch (error) {
      console.error('Error adding officer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'off-duty': return 'bg-gray-500/20 text-gray-400';
      case 'on-patrol': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (showAddOfficer) {
    return <AddOfficerForm onSubmit={handleAddOfficer} onCancel={() => setShowAddOfficer(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Company Dashboard</h1>
              <p className="text-white/70">Elite Security Solutions</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddOfficer(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Officer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Officers</p>
                  <p className="text-2xl font-bold text-white">{officers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {officers.filter(o => o.status === 'active').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">On Patrol</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {officers.filter(o => o.status === 'on-patrol').length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Off Duty</p>
                  <p className="text-2xl font-bold text-gray-400">
                    {officers.filter(o => o.status === 'off-duty').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Officers List */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Security Officers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-white/70">Loading officers...</p>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">No officers found. Add your first officer to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {officers.map((officer) => (
                  <div key={officer.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{officer.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {officer.badge}
                            </Badge>
                            <Badge className={getStatusColor(officer.status)}>
                              {officer.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-white/70">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{officer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{officer.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{officer.location}</span>
                            </div>
                          </div>
                          <div className="text-xs text-white/50 mt-1">
                            {officer.certification} • Joined {officer.joinDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-white/20 text-white/70">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
