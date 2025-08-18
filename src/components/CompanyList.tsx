import React from 'react';
import { useCompanies } from '../hooks/useCompanies';

const CompanyList: React.FC = () => {
  const { companies, loading, error } = useCompanies();

  if (loading) return <div>Loading companies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found</p>
      ) : (
        <ul>
          {companies.map((company) => (
            <li key={company.id}>
              <strong>{company.companyName}</strong>
              <br />
              Email: {company.email}
              <br />
              Phone: {company.phone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyList;