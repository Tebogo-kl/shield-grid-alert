
import React, { useState } from 'react';
import { AlertTriangle, Phone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const EmergencyButton = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleEmergencyPress = () => {
    setIsEmergencyActive(true);
    let timer = 5;
    
    const countdownInterval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      
      if (timer <= 0) {
        clearInterval(countdownInterval);
        // Trigger emergency response
        alert('EMERGENCY ALERT SENT! Multiple officers are being dispatched to your location immediately.');
        setIsEmergencyActive(false);
        setCountdown(5);
      }
    }, 1000);
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setCountdown(5);
  };

  return (
    <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-2" />
          <h2 className="text-lg font-bold text-white">Emergency Response</h2>
        </div>
        
        <p className="text-white/80 text-sm mb-6">
          In case of immediate danger, press the emergency button to alert all nearby security officers
        </p>

        {!isEmergencyActive ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg shadow-lg"
                size="lg"
              >
                <Bell className="h-5 w-5 mr-2" />
                EMERGENCY ALERT
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-red-500">
              <DialogHeader>
                <DialogTitle className="text-red-400 text-center text-xl">
                  Confirm Emergency Alert
                </DialogTitle>
              </DialogHeader>
              <div className="text-center py-6">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
                <p className="text-white mb-6">
                  This will immediately dispatch multiple security officers to your location. 
                  Only use in genuine emergencies.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleEmergencyPress}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    CONFIRM EMERGENCY
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-red-400 animate-pulse">{countdown}</div>
              <p className="text-white text-sm">Emergency alert in {countdown} seconds</p>
            </div>
            <Button 
              onClick={cancelEmergency}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Cancel Emergency
            </Button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-center space-x-4 text-xs text-white/60">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>Direct to Police: 10111</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmergencyButton;
