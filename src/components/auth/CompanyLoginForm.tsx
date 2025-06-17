
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanyLoginFormProps {
  onBack: () => void;
  onSignup: () => void;
}

const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({ onBack, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic and redirect to company dashboard
    console.log('Company login:', { email, password });
    alert('Company login functionality will be implemented with Supabase integration');
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
          <h2 className="text-xl font-semibold text-white">Company Login</h2>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Company Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="company@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Login to Dashboard
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Don't have a company account?{' '}
          <button 
            onClick={onSignup}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Register Company
          </button>
        </p>
      </div>
    </div>
  );
};

export default CompanyLoginForm;
