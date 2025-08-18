export interface Company {
  id: string;
  companyName: string;
  email: string;
  phone: string;
}

export interface CreateCompanyDto {
  companyName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  contactTitle: string;
}

export interface ServiceRequest {
  id: string;
  serviceType: ServiceType;
  locationAddress: string;
  status: RequestStatus;
  totalCost?: number;
  createdAt: string;
}

export interface CreateServiceRequestDto {
  serviceType: ServiceType;
  locationLatitude: number;
  locationLongitude: number;
  locationAddress: string;
  description: string;
  estimatedDuration: number;
}

export enum ServiceType {
  ArmedResponse = "ArmedResponse",
  Patrol = "Patrol",
  Escort = "Escort",
  Emergency = "Emergency",
  Surveillance = "Surveillance"
}

export enum RequestStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled"
}