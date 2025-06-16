
import React from 'react';
import { Shield, Users, MapPin, Phone, Bell, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ServiceSelectorProps {
  onServiceSelect: (service: string) => void;
  selectedService: string;
}

const services = [
  {
    id: 'armed-response',
    name: 'Armed Response',
    description: 'Immediate armed security response',
    icon: Shield,
    color: 'bg-red-500/20 border-red-400 text-red-300',
    urgency: 'Emergency'
  },
  {
    id: 'personal-security',
    name: 'Personal Security',
    description: 'Personal protection and escort',
    icon: Users,
    color: 'bg-blue-500/20 border-blue-400 text-blue-300',
    urgency: 'Standard'
  },
  {
    id: 'patrol-service',
    name: 'Patrol Service',
    description: 'Area surveillance and patrol',
    icon: Car,
    color: 'bg-green-500/20 border-green-400 text-green-300',
    urgency: 'Routine'
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response',
    description: 'General emergency assistance',
    icon: Bell,
    color: 'bg-orange-500/20 border-orange-400 text-orange-300',
    urgency: 'Urgent'
  },
  {
    id: 'escort-service',
    name: 'Escort Service',
    description: 'Safe transportation escort',
    icon: MapPin,
    color: 'bg-purple-500/20 border-purple-400 text-purple-300',
    urgency: 'Scheduled'
  },
  {
    id: 'consultation',
    name: 'Security Consultation',
    description: 'Professional security advice',
    icon: Phone,
    color: 'bg-gray-500/20 border-gray-400 text-gray-300',
    urgency: 'Non-urgent'
  }
];

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onServiceSelect, selectedService }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => {
        const IconComponent = service.icon;
        const isSelected = selectedService === service.id;
        
        return (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isSelected 
                ? 'bg-white/20 border-white/40 shadow-lg' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => onServiceSelect(service.id)}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${service.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">{service.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      service.urgency === 'Emergency' ? 'bg-red-500/20 text-red-300' :
                      service.urgency === 'Urgent' ? 'bg-orange-500/20 text-orange-300' :
                      service.urgency === 'Standard' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {service.urgency}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceSelector;
