import React, { useState, useEffect } from 'react';
import { Building, Users, Plus, MapPin, Phone, Mail, Shield, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AddOfficerForm from '@/components/company/AddOfficerForm';
import CRMSidebar from '@/components/crm/CRMSidebar';
import CRMOverview from '@/components/crm/CRMOverview';
import CRMOfficers from '@/components/crm/CRMOfficers';
import CRMClients from '@/components/crm/CRMClients';
import CRMJobs from '@/components/crm/CRMJobs';
import CRMCompliance from '@/components/crm/CRMCompliance';

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
  psiraNumber?: string;
  isPsiraVerified: boolean;
  psiraStatus?: string;
  psiraCertificateExpiry?: string;
}

interface Company {
  id: string;
  ownerId: string;
  companyName: string;
  email: string;
  phone: string;
  psiraNumber?: string;
  isPsiraVerified: boolean;
  psiraStatus?: string;
  psiraCertificateExpiry?: string;
}

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEntity, setVerificationEntity] = useState<{
    id: string;
    type: 'company' | 'officer';
    name: string;
  } | null>(null);
  const [verificationForm, setVerificationForm] = useState({
    psiraNumber: '',
    status: '',
    expiryDate: '',
    isVerified: false
  });
  
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
      
      const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companiesResponse.ok) throw new Error('Failed to fetch companies');

      const companies = await companiesResponse.json();
      
      const userCompany = companies.find((c: any) => 
        c.ownerId === user.id || c.OwnerId === user.id
      );
      
      if (!userCompany) {
        setOfficers([]);
        setLoading(false);
        return;
      }

      setCompany(userCompany);
      await fetchOfficers(userCompany.id, token);
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({ title: "Error", description: "Failed to fetch company information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async (companyId: string, token: string | null) => {
    try {
      const officersResponse = await fetch(`${API_BASE_URL}/securityofficers/company/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!officersResponse.ok) {
        if (officersResponse.status === 404) {
          setOfficers([]);
          return;
        }
        throw new Error('Failed to fetch officers');
      }

      const officersData = await officersResponse.json();

      const formattedOfficers: Officer[] = officersData.map((officer: any) => {
        let status: 'active' | 'off-duty' | 'on-patrol' = 'off-duty';
        if (officer.status === 'available') status = 'active';
        else if (officer.status === 'busy') status = 'on-patrol';

        return {
          id: officer.id,
          name: `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || 'Unknown',
          badge: officer.badgeNumber || 'N/A',
          phone: officer.phone || 'N/A',
          email: officer.email || 'N/A',
          status,
          location: 'Unknown',
          certification: officer.specializations?.join(', ') || 'General Security',
          joinDate: new Date(officer.createdAt).toLocaleDateString(),
          psiraNumber: officer.psiraNumber,
          isPsiraVerified: officer.isPsiraVerified || false,
          psiraStatus: officer.psiraStatus,
          psiraCertificateExpiry: officer.psiraCertificateExpiry
        };
      });

      setOfficers(formattedOfficers);
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const handleAddOfficer = async (newOfficerData: Omit<Officer, 'id'>) => {
    if (!user || !company) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Missing authentication token.");

      const [firstName, ...lastNameParts] = newOfficerData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      let apiStatus = 'offline';
      if (newOfficerData.status === 'active') apiStatus = 'available';
      else if (newOfficerData.status === 'on-patrol') apiStatus = 'busy';

      const response = await fetch(`${API_BASE_URL}/securityofficers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          badgeNumber: newOfficerData.badge,
          firstName, lastName: lastName || '',
          phone: newOfficerData.phone,
          email: newOfficerData.email,
          status: apiStatus,
          specializations: [newOfficerData.certification]
        }),
      });

      if (!response.ok) throw new Error('Failed to add officer');

      toast({
        title: "Success!",
        description: `Officer ${newOfficerData.name} has been added successfully.`,
      });

      await fetchOfficers(company.id, token);
      setShowAddOfficer(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add officer.", variant: "destructive" });
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!window.confirm('Are you sure you want to delete this officer?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/securityofficers/${officerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete officer');
      }

      toast({
        title: "Success!",
        description: "Officer deleted successfully.",
      });

      if (company) {
        await fetchOfficers(company.id, localStorage.getItem('authToken'));
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete officer.", variant: "destructive" });
    }
  };

  const openVerificationModal = (entityId: string, entityType: 'company' | 'officer', entityName: string, currentPsiraNumber?: string) => {
    setVerificationEntity({ id: entityId, type: entityType, name: entityName });
    setVerificationForm({
      psiraNumber: currentPsiraNumber || '',
      status: '',
      expiryDate: '',
      isVerified: false
    });
    setShowVerificationModal(true);
  };

  const handleOpenPsiraWebsite = () => {
    if (!verificationForm.psiraNumber) {
      toast({
        title: "Error",
        description: "Please enter a PSIRA number first",
        variant: "destructive",
      });
      return;
    }
    window.open(`https://digitalservices.psira.co.za/verify-user/${verificationForm.psiraNumber}`, '_blank');
  };

  const handleSaveVerification = async () => {
    if (!verificationEntity || !verificationForm.status) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const endpoint = verificationEntity.type === 'company'
        ? `${API_BASE_URL}/companies/${verificationEntity.id}/psira-verification`
        : `${API_BASE_URL}/securityofficers/${verificationEntity.id}/psira-verification`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psiraNumber: verificationForm.psiraNumber,
          isPsiraVerified: verificationForm.isVerified,
          psiraStatus: verificationForm.status,
          psiraCertificateExpiry: verificationForm.expiryDate || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save verification');
      }

      toast({
        title: "Success!",
        description: "PSIRA verification saved successfully",
      });

      setShowVerificationModal(false);
      await fetchCompanyAndOfficers();
    } catch (error) {
      console.error('Verification save error:', error);
      toast({
        title: "Error",
        description: "Failed to save verification",
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
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

        {/* Company PSIRA Verification Card */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Company PSIRA Compliance</span>
              <Badge className={company?.isPsiraVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {company?.isPsiraVerified ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {company?.isPsiraVerified && (
                <div className="bg-white/5 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">PSIRA Number:</span>
                    <span className="text-white font-medium">{company.psiraNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Status:</span>
                    <Badge className="bg-green-500/20 text-green-400">{company.psiraStatus}</Badge>
                  </div>
                  {company.psiraCertificateExpiry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Expiry Date:</span>
                      <span className="text-white">{new Date(company.psiraCertificateExpiry).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                onClick={() => openVerificationModal(company?.id || '', 'company', company?.companyName || 'Company', company?.psiraNumber)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {company?.isPsiraVerified ? 'Update' : 'Verify'} Company PSIRA
              </Button>
            </div>
          </CardContent>
        </Card>

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
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="font-semibold text-white">{officer.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {officer.badge}
                            </Badge>
                            <Badge className={getStatusColor(officer.status)}>
                              {officer.status}
                            </Badge>
                            <Badge className={officer.isPsiraVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {officer.isPsiraVerified ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1" /> PSIRA Verified</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
                              )}
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
                          
                          {officer.isPsiraVerified && officer.psiraNumber && (
                            <div className="mt-2 text-xs text-white/50 space-y-1">
                              <div>PSIRA: {officer.psiraNumber} • Status: {officer.psiraStatus}</div>
                              {officer.psiraCertificateExpiry && (
                                <div>Expires: {new Date(officer.psiraCertificateExpiry).toLocaleDateString()}</div>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-white/50 mt-1">
                            {officer.certification} • Joined {officer.joinDate}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => openVerificationModal(officer.id, 'officer', officer.name, officer.psiraNumber)}
                        >
                          {officer.isPsiraVerified ? 'Update' : 'Verify'}
                        </Button>
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

        {/* Verification Modal */}
        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
          <DialogContent className="bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>PSIRA Verification - {verificationEntity?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>PSIRA Number</Label>
                <Input
                  value={verificationForm.psiraNumber}
                  onChange={(e) => setVerificationForm({...verificationForm, psiraNumber: e.target.value})}
                  placeholder="Enter 8-digit PSIRA number"
                  className="bg-gray-800 border-gray-700"
                  maxLength={8}
                />
              </div>

              <Button onClick={handleOpenPsiraWebsite} className="w-full bg-blue-600">
                Open PSIRA Website
              </Button>

              <div className="border-t border-gray-700 pt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      value={verificationForm.status}
                      onChange={(e) => {
                        const status = e.target.value;
                        const isVerified = status === 'Active' || status === 'Registered';
                        setVerificationForm({...verificationForm, status, isVerified});
                      }}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select status</option>
                      <option value="Registered">Registered</option>
                      <option value="Active">Active</option>
                      <option value="Pending renewal">Pending Renewal</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  <div>
                    <Label>Certificate Expiry Date</Label>
                    <Input
                      type="date"
                      value={verificationForm.expiryDate}
                      onChange={(e) => setVerificationForm({...verificationForm, expiryDate: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <Button onClick={handleSaveVerification} className="w-full bg-green-600">
                    Save Verification
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyDashboard;
