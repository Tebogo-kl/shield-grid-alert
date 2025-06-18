
import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Clock, CheckCircle, XCircle, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  profiles: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const OfficerDashboard = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerStatus, setOfficerStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
    fetchOfficerStatus();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles!service_requests_user_id_fkey(first_name, last_name, phone)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any requests with null profiles and ensure type safety
      const validRequests = (data || []).filter(request => 
        request.profiles && 
        typeof request.profiles === 'object' && 
        'first_name' in request.profiles
      ) as ServiceRequest[];
      
      setRequests(validRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficerStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('security_officers')
        .select('status')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOfficerStatus(data?.status || 'offline');
    } catch (error) {
      console.error('Error fetching officer status:', error);
    }
  };

  const updateStatus = async (newStatus: 'available' | 'busy' | 'offline') => {
    try {
      const { error } = await supabase
        .from('security_officers')
        .update({ status: newStatus })
        .eq('user_id', user?.id);

      if (error) throw error;
      setOfficerStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      // Update request status and assign officer
      const { error: requestError } = await supabase
        .from('service_requests')
        .update({ 
          status: 'accepted',
          officer_id: user?.id
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update officer status to busy
      await updateStatus('busy');

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
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
                Welcome, {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </p>
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
                  <p className="text-2xl font-bold text-white">{user?.user_metadata?.badge_number}</p>
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
                          <div className="flex items-center space-x-2 text-white">
                            <User className="h-4 w-4" />
                            <span>{request.profiles.first_name} {request.profiles.last_name}</span>
                            <Phone className="h-4 w-4 ml-4" />
                            <span>{request.profiles.phone}</span>
                          </div>
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
