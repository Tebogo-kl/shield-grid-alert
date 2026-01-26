import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Clock, CheckCircle, Phone, User, Navigation, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IncidentReportForm from '@/components/IncidentReportForm';

const API_BASE_URL = 'https://localhost:44339/api';

interface ServiceRequest {
  id: string;
  userId: string;
  serviceType: number;
  description: string;
  locationAddress: string;
  locationLatitude: number;
  locationLongitude: number;
  status: number;
  estimatedDuration: number;
  createdAt: string;
  userProfile?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

interface OfficerData {
  id: string;
  badgeNumber: string;
  status: string;
  firstName: string;
  lastName: string;
}

const OfficerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerStatus, setOfficerStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [officerData, setOfficerData] = useState<OfficerData | null>(null);
  const { user, securityOfficer } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (securityOfficer?.userId || securityOfficer?.id) {
      fetchOfficerData();
      fetchPendingRequests();
      fetchMyRequests();
      
      const interval = setInterval(() => {
        fetchPendingRequests();
        fetchMyRequests();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [securityOfficer]);

  const fetchOfficerData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = securityOfficer?.userId || user?.id;
      
      if (!userId) return;

      const response = await fetch(`${API_BASE_URL}/securityofficers/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOfficerData(data);
        
        const statusLower = (data.status || '').toLowerCase();
        if (statusLower === 'available') setOfficerStatus('available');
        else if (statusLower === 'busy') setOfficerStatus('busy');
        else setOfficerStatus('offline');
      }
    } catch (error) {
      console.error('Error fetching officer data:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/servicerequests/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      } else if (response.status === 404) {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    const officerId = officerData?.id || securityOfficer?.id;
    if (!officerId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/servicerequests/officer/${officerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.filter((r: ServiceRequest) => r.status === 1 || r.status === 2));
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const updateStatus = async (newStatus: 'available' | 'busy' | 'offline') => {
    const officerId = officerData?.id || securityOfficer?.id;
    
    if (!officerId) {
      toast({ title: "Error", description: "Officer information not loaded.", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/securityofficers/${officerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOfficerStatus(newStatus);
        toast({ title: "Status Updated", description: `Your status is now ${newStatus}` });

        if (newStatus === 'available' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            await fetch(`${API_BASE_URL}/securityofficers/${officerId}/location`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            });
          });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const acceptRequest = async (requestId: string) => {
    const officerId = officerData?.id || securityOfficer?.id;
    
    if (!officerId) {
      toast({ title: "Error", description: "Officer information not loaded.", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/servicerequests/${requestId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId }),
      });

      if (response.ok) {
        toast({ title: "Request Accepted", description: "You have accepted the service request." });
        setOfficerStatus('busy');
        await fetchPendingRequests();
        await fetchMyRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to accept request.", variant: "destructive" });
    }
  };

  const completeRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/servicerequests/${requestId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCost: null }),
      });

      if (response.ok) {
        toast({ title: "Request Completed", description: "The service request has been marked as complete." });
        setOfficerStatus('available');
        await fetchMyRequests();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete request.", variant: "destructive" });
    }
  };

  const getServiceTypeName = (type: number) => {
    const types = ['Armed Response', 'Patrol', 'Escort', 'Emergency', 'Surveillance'];
    return types[type] || 'Unknown';
  };

  const getServiceTypeColor = (type: number) => {
    const colors = [
      'bg-orange-500/20 text-orange-400',
      'bg-blue-500/20 text-blue-400',
      'bg-green-500/20 text-green-400',
      'bg-red-500/20 text-red-400',
      'bg-purple-500/20 text-purple-400',
    ];
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-orange-500/20 text-orange-400';
      case 'offline': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
              <p className="text-white/70">
                Welcome, {user?.firstName || officerData?.firstName} {user?.lastName || officerData?.lastName}
              </p>
              {officerData?.badgeNumber && (
                <p className="text-sm text-orange-400">Badge: {officerData.badgeNumber}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(officerStatus)}>{officerStatus.toUpperCase()}</Badge>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={officerStatus === 'available' ? 'default' : 'outline'}
                onClick={() => updateStatus('available')}
                className="bg-green-600 hover:bg-green-700"
                disabled={myRequests.length > 0}
              >
                Available
              </Button>
              <Button
                size="sm"
                variant={officerStatus === 'offline' ? 'default' : 'outline'}
                onClick={() => updateStatus('offline')}
                className="bg-red-600 hover:bg-red-700"
              >
                Offline
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Pending Requests</p>
                  <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{myRequests.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Status</p>
                  <p className="text-2xl font-bold text-white capitalize">{officerStatus}</p>
                </div>
                <User className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Jobs */}
        {myRequests.length > 0 && (
          <Card className="bg-orange-500/10 border-orange-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-orange-400">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getServiceTypeColor(request.serviceType)}>
                        {getServiceTypeName(request.serviceType)}
                      </Badge>
                      <span className="text-white/70 text-sm">
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {request.userProfile && (
                      <div className="flex items-center space-x-4 text-white mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{request.userProfile.firstName} {request.userProfile.lastName}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <a href={`tel:${request.userProfile.phone}`} className="text-blue-400">
                            {request.userProfile.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-white/70 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{request.locationAddress}</span>
                    </div>
                    
                    {request.description && (
                      <p className="text-white/80 text-sm mb-3">{request.description}</p>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => openInMaps(request.locationLatitude, request.locationLongitude)}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => completeRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Available Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-white/70">Loading requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">No pending requests at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getServiceTypeColor(request.serviceType)}>
                            {getServiceTypeName(request.serviceType)}
                          </Badge>
                          <span className="text-white/70 text-sm">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {request.userProfile && (
                          <div className="flex items-center space-x-2 text-white mb-2">
                            <User className="h-4 w-4" />
                            <span>{request.userProfile.firstName} {request.userProfile.lastName}</span>
                            <Phone className="h-4 w-4 ml-4" />
                            <span>{request.userProfile.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-white/70">
                          <MapPin className="h-4 w-4" />
                          <span>{request.locationAddress}</span>
                        </div>
                        
                        {request.description && (
                          <p className="text-white/80 text-sm mt-2">{request.description}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={officerStatus !== 'available'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incident Report Section */}
        {myRequests.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Incident Report & Communication</h2>
            </div>
            <div className="max-w-2xl">
              <IncidentReportForm 
                userType="officer"
                requestId={myRequests[0]?.id || 'REQ-001'}
                serviceType={getServiceTypeName(myRequests[0]?.serviceType || 0)}
                onSubmit={(report) => console.log('Officer report submitted:', report)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;