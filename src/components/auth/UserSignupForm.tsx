
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface UserSignupFormProps {
  onBack: () => void;
  onLogin: () => void;
}

const UserSignupForm: React.FC<UserSignupFormProps> = ({ onBack, onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
      }
    );

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
          <User className="h-6 w-6 text-green-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">User Sign Up</h2>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white/90">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="John"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white/90">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/90">Phone</Label>
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
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-white/90">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="123 Main St, City, State"
              disabled={loading}
            />
          </div>
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
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Already have an account?{' '}
          <button 
            onClick={onLogin}
            className="text-green-400 hover:text-green-300 underline"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserSignupForm;
