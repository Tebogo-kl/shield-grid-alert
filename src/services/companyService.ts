// src/services/companyService.ts
import { apiClient } from './api';
import { Company, CreateCompanyDto } from '../types/api';

export const companyService = {
  // Get all companies
  getAll: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/companies');
    return response.data;
  },

  // Get company by ID
  getById: async (id: string): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return response.data;
  },

  // Create new company
  create: async (company: CreateCompanyDto): Promise<Company> => {
    const response = await apiClient.post<Company>('/companies', company);
    return response.data;
  },

  // Update company
  update: async (id: string, company: Partial<CreateCompanyDto>): Promise<Company> => {
    const response = await apiClient.put<Company>(`/companies/${id}`, company);
    return response.data;
  },

  // Delete company
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/companies/${id}`);
  }
};