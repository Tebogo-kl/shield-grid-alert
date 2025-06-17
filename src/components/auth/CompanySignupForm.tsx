
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Building, Phone, MapPin, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CompanySignupFormProps {
  onBack: () => void;
  onLogin: () => void;
}

const CompanySignupForm: React.FC<CompanySignupFormProps> = ({ onBack, onLogin }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    contactPerson: '',
    contactTitle: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Implement actual signup logic
    console.log('Company signup:', formData);
    alert('Company registration functionality will be implemented with Supabase integration');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-3 text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center">
          <Building className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Company Registration</h2>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white/90">Company Name</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Security Solutions Inc."
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber" className="text-white/90">Registration Number</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="registrationNumber"
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="REG123456789"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-white/90">Contact Person</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-white/50" />
              <Input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="John Smith"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactTitle" className="text-white/90">Title</Label>
            <Input
              id="contactTitle"
              type="text"
              value={formData.contactTitle}
              onChange={(e) => handleInputChange('contactTitle', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Manager"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Company Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="info@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="+27 11 123 4567"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-white/90">Company Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="123 Business St, Johannesburg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white/90">Company Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            placeholder="Brief description of your security services..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Create a password"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Register Company
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Already have a company account?{' '}
          <button 
            onClick={onLogin}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default CompanySignupForm;
