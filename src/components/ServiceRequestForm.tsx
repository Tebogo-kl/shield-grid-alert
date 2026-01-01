import React, { useState } from 'react';
import { Shield, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://localhost:44339/api';

interface ServiceRequestFormProps {
  selectedService: string;
  userLocation: { lat: number; lng: number };
  locationAddress: string;
  selectedOfficerId?: string;
  onRequestCreated?: (request: any) => void;
  onCancel?: () => void;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  selectedService,
  userLocation,
  locationAddress,
  selectedOfficerId,
  onRequestCreated,
  onCancel,
}) => {
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const serviceTypeMap: Record<string, number> = {
    'armed_response': 0,  // ArmedResponse
    'patrol': 1,          // Patrol
    'escort': 2,          // Escort
    'emergency': 3,       // Emergency
    'surveillance': 4,    // Surveillance
  };

  const getServiceDisplayName = (service: string) => {
    return service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to request services",
        variant: "destructive",
      });
      return;
    }

    if (!selectedService) {
      toast({
        title: "No Service Selected",
        description: "Please select a service type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      const requestData = {
        serviceType: serviceTypeMap[selectedService] ?? 0,
        locationLatitude: userLocation.lat,
        locationLongitude: userLocation.lng,
        locationAddress: locationAddress || 'Location not specified',
        description: description || `${getServiceDisplayName(selectedService)} request`,
        estimatedDuration: estimatedDuration,
        preferredOfficerId: selectedOfficerId || null,
      };

      console.log('Creating service request:', requestData);

      const response = await fetch(`${API_BASE_URL}/servicerequests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create request');
      }

      const result = await response.json();
      console.log('Request created:', result);

      toast({
        title: "Request Submitted!",
        description: "Your security request has been sent. An officer will respond shortly.",
      });

      onRequestCreated?.(result);
      
      // Reset form
      setDescription('');
      setEstimatedDuration(60);

    } catch (error: any) {
      console.error('Error creating request:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Could not submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedService) {
    return null;
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-400" />
          Request {getServiceDisplayName(selectedService)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Display */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-blue-400 mt-1" />
            <div>
              <p className="text-white text-sm font-medium">Your Location</p>
              <p className="text-white/70 text-xs">{locationAddress || 'Getting location...'}</p>
              <p className="text-white/50 text-xs mt-1">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-white/70 text-sm mb-1 block">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your security needs..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={3}
          />
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="text-white/70 text-sm mb-2 block flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Estimated Duration
          </label>
          <div className="flex space-x-2">
            {[30, 60, 120, 240].map((mins) => (
              <Button
                key={mins}
                type="button"
                size="sm"
                variant={estimatedDuration === mins ? 'default' : 'outline'}
                className={estimatedDuration === mins 
                  ? 'bg-blue-600' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                onClick={() => setEstimatedDuration(mins)}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Officer (if any) */}
        {selectedOfficerId && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="text-green-400 text-sm">Specific officer selected</p>
            </div>
          </div>
        )}

        {/* Emergency Notice */}
        {selectedService === 'emergency' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Emergency Request</p>
                <p className="text-red-400/70 text-xs">
                  This will be treated as high priority. Officers will be dispatched immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            className={`flex-1 ${
              selectedService === 'emergency' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleSubmit}
            disabled={loading || !user}
          >
            {loading ? (
              <>
                <Shield className="h-4 w-4 mr-2 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {user ? 'Submit Request' : 'Sign in to Request'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;