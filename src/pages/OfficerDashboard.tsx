
import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Clock, CheckCircle, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://localhost:44339/api';

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  description: string;
  location_address: string;
  location_latitude: number;
  location_longitude: number;
  status: string;
  created_at: string;
  user_profile?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}
const OfficerDashboard = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerStatus, setOfficerStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [officerId, setOfficerId] = useState<string | null>(null);
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOfficerData();
      fetchRequests();
      
      // Poll for new requests every 10 seconds
      const interval = setInterval(() => {
        fetchRequests();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
  if (user && user.id) {
    setOfficerId(user.id);
  }
}, [user]);

 const fetchOfficerData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    console.log('Fetching officer data for user:', user?.id);
    
    // Get officer information by user ID
    const response = await fetch(`${API_BASE_URL}/securityofficers/user/${user?.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Officer fetch response:', response.status);

    if (response.ok) {
      const officerData = await response.json();
      console.log('Officer data:', officerData);
      
      setOfficerId(officerData.id);
      setBadgeNumber(officerData.badgeNumber);
      
      // Map API status to UI status
      const statusLower = officerData.status.toLowerCase();
      if (statusLower === 'available') setOfficerStatus('available');
      else if (statusLower === 'busy') setOfficerStatus('busy');
      else setOfficerStatus('offline');
    } else {
      console.error('Failed to fetch officer data:', response.status);
    }
  } catch (error) {
    console.error('Error fetching officer data:', error);
  }
};
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Get pending service requests
      const response = await fetch(`${API_BASE_URL}/servicerequests/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setRequests([]);
          return;
        }
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      
      // Format the data to match UI expectations
      const formattedRequests = data.map((req: any) => ({
        id: req.id,
        userId: req.userId,
        serviceType: req.serviceType,
        description: req.description,
        locationAddress: req.locationAddress,
        locationLatitude: req.locationLatitude,
        locationLongitude: req.locationLongitude,
        status: req.status,
        createdAt: req.createdAt,
        userProfile: req.userProfile ? {
          firstName: req.userProfile.firstName,
          lastName: req.userProfile.lastName,
          phone: req.userProfile.phone
        } : undefined
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'available' | 'busy' | 'offline') => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Map UI status to API status
      let apiStatus = 'offline';
      if (newStatus === 'available') apiStatus = 'available';
      else if (newStatus === 'busy') apiStatus = 'busy';

      const response = await fetch(`${API_BASE_URL}/securityofficers/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: apiStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setOfficerStatus(newStatus);

      toast({
        title: "Status Updated",
        description: `Your status is now ${newStatus}`,
      });

      // Update location when going available
      if (newStatus === 'available' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await fetch(`${API_BASE_URL}/securityofficers/${officerId}/location`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
          });
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Accept the request
      const response = await fetch(`${API_BASE_URL}/servicerequests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ officerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      toast({
        title: "Request Accepted",
        description: "You have successfully accepted the service request.",
      });

      // Update officer status to busy
      await updateStatus('busy');

      // Refresh requests
      await fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-500/20 text-red-400';
      case 'armed_response': return 'bg-orange-500/20 text-orange-400';
      case 'patrol': return 'bg-blue-500/20 text-blue-400';
      case 'escort': return 'bg-green-500/20 text-green-400';
      case 'surveillance': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-orange-500/20 text-orange-400';
      case 'offline': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
                  Welcome, {user?.firstName} {user?.lastName}
              </p>
              <p className="text-2xl font-bold text-white">{badgeNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(officerStatus)}>
              {officerStatus.toUpperCase()}
            </Badge>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={officerStatus === 'available' ? 'default' : 'outline'}
                onClick={() => updateStatus('available')}
                className="bg-green-600 hover:bg-green-700"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Pending Requests</p>
                  <p className="text-2xl font-bold text-white">{requests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
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
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Badge</p>
                  <p className="text-2xl font-bold text-white">{user?.user_metadata?.badgeNumber}</p>
                  <p className="text-2xl font-bold text-white">{badgeNumber || 'N/A'}</p>
                </div>
                <User className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Available Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-white/70">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">No pending requests at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getServiceTypeColor(request.service_type)}>
                            {request.service_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-white/70 text-sm">
                            {new Date(request.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {request.user_profile && (
                            <div className="flex items-center space-x-2 text-white">
                              <User className="h-4 w-4" />
                              <span>{request.user_profile.firstName} {request.user_profile.lastName}</span>
                              <Phone className="h-4 w-4 ml-4" />
                              <span>{request.user_profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-white/70">
                            <MapPin className="h-4 w-4" />
                            <span>{request.location_address}</span>
                          </div>
                          {request.description && (
                            <p className="text-white/80 text-sm">{request.description}</p>
                          )}
                        </div>
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
      </div>
    </div>
  );
};

export default OfficerDashboard;
