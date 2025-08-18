import { useState, useEffect } from 'react';
import { Company } from '../types/api';
import { companyService } from '../services/companyService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, error, refetch: fetchCompanies };
};