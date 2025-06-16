
import React from 'react';
import { Star, MapPin, Clock, Shield, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Officer {
  id: number;
  name: string;
  company: string;
  rating: number;
  distance: string;
  estimatedArrival: string;
  specialization: string;
  status: string;
  profileImage: string;
  yearsExperience: number;
  completedJobs: number;
  responseTime: string;
}

interface OfficerCardProps {
  officer: Officer;
  onRequest: () => void;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ officer, onRequest }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-300 border-green-400';
      case 'responding': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400';
      case 'busy': return 'bg-red-500/20 text-red-300 border-red-400';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400';
    }
  };

  const isAvailable = officer.status === 'available';

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Officer Avatar */}
          <Avatar className="w-12 h-12 border-2 border-white/20">
            <AvatarImage src={officer.profileImage} alt={officer.name} />
            <AvatarFallback className="bg-blue-500 text-white">
              {officer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          {/* Officer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-white text-sm">{officer.name}</h3>
                <p className="text-white/70 text-xs">{officer.company}</p>
              </div>
              <Badge className={getStatusColor(officer.status)}>
                {officer.status}
              </Badge>
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center space-x-4 mb-3 text-xs">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-white/80">{officer.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-white/60" />
                <span className="text-white/80">{officer.distance}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-white/60" />
                <span className="text-white/80">{officer.estimatedArrival}</span>
              </div>
            </div>

            {/* Specialization */}
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-3 w-3 text-blue-400" />
              <span className="text-blue-300 text-xs font-medium">{officer.specialization}</span>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="text-center">
                <div className="text-white font-medium">{officer.yearsExperience}y</div>
                <div className="text-white/60">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">{officer.completedJobs.toLocaleString()}</div>
                <div className="text-white/60">Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">{officer.responseTime}</div>
                <div className="text-white/60">Response</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={onRequest}
                disabled={!isAvailable}
                className={`flex-1 text-xs ${
                  isAvailable 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isAvailable ? 'Request Officer' : 'Not Available'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Phone className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OfficerCard;
