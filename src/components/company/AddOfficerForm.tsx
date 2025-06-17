
import React, { useState } from 'react';
import { ArrowLeft, Shield, User, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Officer {
  name: string;
  badge: string;
  phone: string;
  email: string;
  status: 'active' | 'off-duty' | 'on-patrol';
  location: string;
  certification: string;
  joinDate: string;
}

interface AddOfficerFormProps {
  onSubmit: (officer: Officer) => void;
  onCancel: () => void;
}

const AddOfficerForm: React.FC<AddOfficerFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    badge: '',
    phone: '',
    email: '',
    status: 'active' as Officer['status'],
    location: '',
    certification: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCancel}
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-white">Add New Security Officer</CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/90">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="John Mthembu"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge" className="text-white/90">Badge Number</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="badge"
                      type="text"
                      value={formData.badge}
                      onChange={(e) => handleInputChange('badge', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="SEC003"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="+27 82 123 4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white/90">Current Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Sandton City"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white/90">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="active" className="text-white hover:bg-gray-700">Active</SelectItem>
                      <SelectItem value="off-duty" className="text-white hover:bg-gray-700">Off Duty</SelectItem>
                      <SelectItem value="on-patrol" className="text-white hover:bg-gray-700">On Patrol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certification" className="text-white/90">Certification</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="certification"
                      type="text"
                      value={formData.certification}
                      onChange={(e) => handleInputChange('certification', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Armed Response"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate" className="text-white/90">Join Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add Officer
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white/70">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddOfficerForm;
