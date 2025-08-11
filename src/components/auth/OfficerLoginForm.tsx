
import React, { useState } from 'react';
import { ArrowLeft, Shield, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OfficerLoginFormProps {
  onBack: () => void;
}

const OfficerLoginForm: React.FC<OfficerLoginFormProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { officerSignIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await officerSignIn(name, badgeNumber);
    
    if (!error) {
      navigate('/officer-dashboard');
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
          <Shield className="h-6 w-6 text-orange-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Officer Login</h2>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/90">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge" className="text-white/90">Badge Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="badge"
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your badge number"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login to Dashboard'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Contact your company administrator if you need assistance
        </p>
      </div>
    </div>
  );
};

export default OfficerLoginForm;
