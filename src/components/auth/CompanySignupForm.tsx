
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Building, Phone, MapPin, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
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

    setLoading(true);

    try {
      // First, create the user account
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.contactPerson.split(' ')[0] || '',
          last_name: formData.contactPerson.split(' ').slice(1).join(' ') || '',
          phone: formData.phone,
          address: formData.address,
        }
      );

      if (signUpError) {
        setLoading(false);
        return;
      }

      // Then, create the company record
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: formData.companyName,
          registration_number: formData.registrationNumber,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          contact_person: formData.contactPerson,
          contact_title: formData.contactTitle,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (companyError) {
        console.error('Company creation error:', companyError);
        toast({
          title: "Company Registration Error",
          description: "Failed to register company. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Company registration successful. Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An error occurred during registration.",
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
