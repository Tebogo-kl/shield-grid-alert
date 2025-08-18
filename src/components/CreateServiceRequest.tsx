import React, { useState } from 'react';
import { CreateServiceRequestDto, ServiceType } from '../types/api';
import { serviceRequestService } from '../services/serviceRequestService';

const CreateServiceRequest: React.FC = () => {
  const [formData, setFormData] = useState<CreateServiceRequestDto>({
    serviceType: ServiceType.ArmedResponse,
    locationLatitude: 0,
    locationLongitude: 0,
    locationAddress: '',
    description: '',
    estimatedDuration: 60
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await serviceRequestService.create(formData);
      console.log('Service request created:', result);
      // Reset form or redirect
      setFormData({
        serviceType: ServiceType.ArmedResponse,
        locationLatitude: 0,
        locationLongitude: 0,
        locationAddress: '',
        description: '',
        estimatedDuration: 60
      });
      alert('Service request created successfully!');
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'locationLatitude' || name === 'locationLongitude' || name === 'estimatedDuration' 
        ? parseFloat(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Service Request</h2>
      
      <div>
        <label>Service Type:</label>
        <select name="serviceType" value={formData.serviceType} onChange={handleInputChange}>
          {Object.values(ServiceType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Address:</label>
        <input
          type="text"
          name="locationAddress"
          value={formData.locationAddress}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Estimated Duration (minutes):</label>
        <input
          type="number"
          name="estimatedDuration"
          value={formData.estimatedDuration}
          onChange={handleInputChange}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  );
};

export default CreateServiceRequest;