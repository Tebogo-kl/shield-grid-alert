import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Building, Phone, MapPin, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CompanySignupFormProps {
  onBack: () => void;
  onLogin: () => void;
}

const API_BASE_URL = 'https://localhost:44339/api';

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
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting company registration...');

      // Call your .NET API endpoint for company registration
      const response = await fetch(`${API_BASE_URL}/companies/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          contactPerson: formData.contactPerson,
          contactTitle: formData.contactTitle,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Company registration response:', { status: response.status, data });

      if (!response.ok) {
        toast({
          title: "Registration Error",
          description: data.message || data.error || 'Failed to register company',
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: "Company registered successfully! You can now sign in.",
      });

      // Redirect to login after successful registration
      setTimeout(() => {
        onLogin();
      }, 2000);

    } catch (error: any) {
      console.error('Company registration error:', error);
      toast({
        title: "Network Error",
        description: error.message || "Failed to connect to the server. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
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
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="SecureGuard Solutions"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber" className="text-white/90">Registration Number</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="registrationNumber"
              name="registrationNumber"
              type="text"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="REG123456789"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Company Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="admin@secureguard.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="+1 (555) 123-4567"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-white/90">Company Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="123 Business Ave, City, State"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-white/90">Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
              <Input
                id="contactPerson"
                name="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="John Smith"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactTitle" className="text-white/90">Contact Title</Label>
            <Input
              id="contactTitle"
              name="contactTitle"
              type="text"
              value={formData.contactTitle}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="CEO"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white/90">Company Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            placeholder="Brief description of your security services..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Registering Company...' : 'Register Company'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Already have a company account?{' '}
          <button 
            onClick={onLogin}
            className="text-blue-400 hover:text-blue-300 underline"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default CompanySignupForm;