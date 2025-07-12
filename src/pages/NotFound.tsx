
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    if (isAuthenticated) {
      const homePath = userProfile?.role === 'company_admin' 
        ? '/company-dashboard' 
        : userProfile?.role === 'security_officer'
          ? '/officer-dashboard'
          : '/home';
      navigate(homePath);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-8 text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-16 w-16 text-blue-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        
        <Button 
          onClick={handleGoHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Home className="h-4 w-4 mr-2" />
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
