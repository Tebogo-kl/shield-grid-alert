import React, { useState, useEffect } from 'react';
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
}

interface Company {
  id: string;
  ownerId: string;
  companyName: string;
  email: string;
  phone: string;
}

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyPsiraOpen, setCompanyPsiraOpen] = useState(false);
  const [companyPsiraNumber, setCompanyPsiraNumber] = useState('');
  const [companyVerified, setCompanyVerified] = useState(false);
  const [officerVerifications, setOfficerVerifications] = useState<Record<string, { open: boolean; psira: string; verified: boolean }>>({});
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
      const userCompany = companies.find((c: any) => c.ownerId === user.id || c.OwnerId === user.id);
      
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
        if (officersResponse.status === 404) { setOfficers([]); return; }
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
          joinDate: new Date(officer.createdAt).toLocaleDateString()
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

      toast({ title: "Success!", description: `Officer ${newOfficerData.name} has been added.` });
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

      if (!response.ok) throw new Error('Failed to delete officer');
      toast({ title: "Success!", description: "Officer deleted successfully." });
      if (company) await fetchOfficers(company.id, token);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete officer.", variant: "destructive" });
    }
  };

  const handleVerifyCompany = () => {
    if (!companyPsiraNumber.trim()) {
      toast({ title: "Error", description: "Please enter a PSIRA number", variant: "destructive" });
      return;
    }
    setCompanyVerified(true);
    toast({ title: "Success!", description: "Company PSIRA number verified." });
  };

  const handleVerifyOfficer = (officerId: string) => {
    const verification = officerVerifications[officerId];
    if (!verification?.psira.trim()) {
      toast({ title: "Error", description: "Please enter a PSIRA number", variant: "destructive" });
      return;
    }
    setOfficerVerifications({ ...officerVerifications, [officerId]: { ...verification, verified: true } });
    toast({ title: "Success!", description: "Officer PSIRA number verified." });
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CRMOverview officers={officers} />;
      case 'officers':
        return (
          <CRMOfficers
            officers={officers}
            onAddOfficer={() => setShowAddOfficer(true)}
            onDeleteOfficer={handleDeleteOfficer}
            officerVerifications={officerVerifications}
            setOfficerVerifications={setOfficerVerifications}
            onVerifyOfficer={handleVerifyOfficer}
          />
        );
      case 'clients':
        return <CRMClients />;
      case 'jobs':
        return <CRMJobs />;
      case 'compliance':
        return (
          <CRMCompliance
            companyPsiraOpen={companyPsiraOpen}
            setCompanyPsiraOpen={setCompanyPsiraOpen}
            companyPsiraNumber={companyPsiraNumber}
            setCompanyPsiraNumber={setCompanyPsiraNumber}
            companyVerified={companyVerified}
            onVerifyCompany={handleVerifyCompany}
          />
        );
      default:
        return <div className="text-white text-center py-12">Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <CRMSidebar activeTab={activeTab} setActiveTab={setActiveTab} companyName={company?.companyName} />
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default CompanyDashboard;
