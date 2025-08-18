// src/services/serviceRequestService.ts
import { apiClient } from './api';
import { ServiceRequest, CreateServiceRequestDto, RequestStatus } from '../types/api';

export const serviceRequestService = {
  // Get user's service requests
  getByUser: async (userId: string): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>(`/servicerequests/user/${userId}`);
    return response.data;
  },

  // Create new service request
  create: async (request: CreateServiceRequestDto): Promise<ServiceRequest> => {
    const response = await apiClient.post<ServiceRequest>('/servicerequests', request);
    return response.data;
  },

  // Update request status
  updateStatus: async (id: string, status: RequestStatus): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(`/servicerequests/${id}/status`, status);
    return response.data;
  }
};
