import React, { useState, useEffect } from 'react';
import { Building, Users, Plus, MapPin, Phone, Mail, Shield, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AddOfficerForm from '@/components/company/AddOfficerForm';

const API_BASE_URL = 'https://localhost:44339/api';

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

interface Company {
  id: string;
  ownerId:string;
  companyName: string;
  email: string;
  phone: string;
}

const CompanyDashboard = () => {
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCompanyAndOfficers();
    }
  }, [user]);

  const fetchCompanyAndOfficers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // First, get the company owned by this user
      const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companiesResponse.ok) {
        throw new Error('Failed to fetch companies');
      }

      const companies = await companiesResponse.json();
      
      console.log('Companies fetched:', companies);
      console.log('Current user ID:', user.id);
      
      // Find the company owned by the current user (handle both camelCase and PascalCase)
      const userCompany = companies.find((c: any) => 
        c.ownerId === user.id || c.OwnerId === user.id      );
      
      if (!userCompany) {
        console.log('No company found for user');
        console.log('Available companies:', companies.map((c: any) => ({ id: c.id, ownerId: c.ownerId || c.OwnerId })));
        setOfficers([]);
        setLoading(false);
        return;
      }
      
      console.log('Found company:', userCompany);

      setCompany(userCompany);

      // Fetch officers for this company
      await fetchOfficers(userCompany.id, token);
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async (companyId: string, token: string | null) => {
    try {
      // Fetch security officers for this company
      const officersResponse = await fetch(`${API_BASE_URL}/securityofficers/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!officersResponse.ok) {
        if (officersResponse.status === 404) {
          // No officers found
          setOfficers([]);
          return;
        }
        throw new Error('Failed to fetch officers');
      }

      const officersData = await officersResponse.json();

      // Format officers data
      const formattedOfficers: Officer[] = officersData.map((officer: any) => {
        // Map API status to UI status
        let status: 'active' | 'off-duty' | 'on-patrol' = 'off-duty';
        if (officer.status === 'available') status = 'active';
        else if (officer.status === 'busy') status = 'on-patrol';
        else status = 'off-duty';

        return {
          id: officer.id,
          name: `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || 'Unknown',
          badge: officer.badgeNumber || 'N/A',
          phone: officer.phone || 'N/A',
          email: officer.email || 'N/A',
          status,
          location: 'Unknown',
          certification: officer.specializations?.join(', ') || 'General Security',
          joinDate: new Date(officer.createdAt).toLocaleDateString()
        };
      });

      setOfficers(formattedOfficers);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch officers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddOfficer = async (newOfficerData: Omit<Officer, 'id'>) => {
    if (!user || !company) {
      toast({
        title: "Error",
        description: "Company information not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
    if (!token) { // Add a check for a missing token
          throw new Error("Missing authentication token. Please log in again.");
      }

      // Split name
      const [firstName, ...lastNameParts] = newOfficerData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Map UI status to API status
      let apiStatus = 'offline';
      if (newOfficerData.status === 'active') apiStatus = 'available';
      else if (newOfficerData.status === 'on-patrol') apiStatus = 'busy';

      // Create officer
      const response = await fetch(`${API_BASE_URL}/securityofficers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: company.id,
          badgeNumber: newOfficerData.badge,
          firstName: firstName,
          lastName: lastName || '',
          phone: newOfficerData.phone,
          email: newOfficerData.email,
          status: apiStatus,
          specializations: [newOfficerData.certification]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add officer');
      }

      toast({
        title: "Success!",
        description: `Officer ${newOfficerData.name} has been added successfully.`,
      });

      // Refresh officers list
      await fetchOfficers(company.id, token);
      setShowAddOfficer(false);
    } catch (error: any) {
      console.error('Error adding officer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add officer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!window.confirm('Are you sure you want to delete this officer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/securityofficers/${officerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete officer');
      }

      toast({
        title: "Success!",
        description: "Officer deleted successfully.",
      });

      // Refresh officers list
      if (company) {
        await fetchOfficers(company.id, token);
      }
    } catch (error) {
      console.error('Error deleting officer:', error);
      toast({
        title: "Error",
        description: "Failed to delete officer. Please try again.",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
              <p className="text-white/70">
                {company?.companyName || `${userProfile?.firstName || 'Your'} Security Company`}
              </p>
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
            {officers.length === 0 ? (
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteOfficer(officer.id)}
                        >
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