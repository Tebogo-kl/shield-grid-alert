import { useState, useEffect } from 'react';
import { ServiceRequest } from '../types/api';
import { serviceRequestService } from '../services/serviceRequestService';

export const useServiceRequests = (userId: string) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await serviceRequestService.getByUser(userId);
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch service requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  return { requests, loading, error, refetch: fetchRequests };
};
