import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserLoginFormProps {
  onBack: () => void;
  onSignup: () => void;
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({ onBack, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // Login successful - navigate to home
        console.log('Login successful, navigating to /home');
        navigate('/home');
      } else {
        // Error is already shown in toast by AuthContext
        console.error('Login failed:', error);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-semibold text-white">User Login</h2>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your email"
              required
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          Don't have an account?{' '}
          <button 
            onClick={onSignup}
            className="text-green-400 hover:text-green-300 underline"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserLoginForm;