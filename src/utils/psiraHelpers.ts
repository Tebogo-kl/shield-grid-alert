// utils/psiraHelpers.ts
export const validatePsiraNumber = (number: string): boolean => {
  // PSIRA numbers are typically 8 digits
  const regex = /^\d{8}$/;
  return regex.test(number);
};

export const formatPsiraNumber = (number: string): string => {
  // Format as XXXX-XXXX
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return cleaned;
};

export const isPsiraExpiringSoon = (expiryDate: string | null, daysThreshold: number = 30): boolean => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
};

export const isPsiraExpired = (expiryDate: string | null): boolean => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  return expiry < today;
};

export const getPsiraStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
    case 'Registered':
      return 'bg-green-500/20 text-green-400';
    case 'Pending renewal':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'Withdrawn':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};