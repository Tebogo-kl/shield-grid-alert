
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/home');
    }
    
    setLoading(false);
  };

  const handleStaticLogin = () => {
    setLoading(true);
    
    // Simulate a successful login with static user data
    setTimeout(() => {
      // Create a mock session for temporary access
      localStorage.setItem('temp_user', JSON.stringify({
        id: 'temp-user-123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      }));
      
      toast({
        title: "Temporary Login Successful",
        description: "You are now logged in with a test account.",
      });
      
      navigate('/home');
      setLoading(false);
    }, 1000);
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

      {/* Temporary Static Login Section */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center mb-2">
          <TestTube className="h-4 w-4 text-yellow-400 mr-2" />
          <h3 className="text-sm font-medium text-yellow-300">Temporary Testing Login</h3>
        </div>
        <p className="text-xs text-yellow-200/80 mb-3">
          For development and testing purposes only
        </p>
        <Button 
          onClick={handleStaticLogin}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Test User'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-white/60">Or continue with email</span>
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
          {loading ? 'Signing in...' : 'Login with Email'}
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
