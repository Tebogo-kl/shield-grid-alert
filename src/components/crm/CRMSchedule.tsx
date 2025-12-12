import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Shift {
  id: string;
  officerName: string;
  client: string;
  location: string;
  startTime: string;
  endTime: string;
  type: 'day' | 'night' | 'event';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const mockShifts: Shift[] = [
  { id: '1', officerName: 'John Doe', client: 'ABC Corporation', location: 'Sandton', startTime: '06:00', endTime: '18:00', type: 'day', status: 'completed' },
  { id: '2', officerName: 'Jane Smith', client: 'XYZ Mall', location: 'Rosebank', startTime: '18:00', endTime: '06:00', type: 'night', status: 'in-progress' },
  { id: '3', officerName: 'Mike Johnson', client: 'Tech Park', location: 'Midrand', startTime: '08:00', endTime: '17:00', type: 'day', status: 'scheduled' },
  { id: '4', officerName: 'Sarah Williams', client: 'Hotel Grand', location: 'Pretoria', startTime: '14:00', endTime: '22:00', type: 'event', status: 'scheduled' },
  { id: '5', officerName: 'David Brown', client: 'ABC Corporation', location: 'Sandton', startTime: '18:00', endTime: '06:00', type: 'night', status: 'scheduled' },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CRMSchedule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [shifts] = useState<Shift[]>(mockShifts);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'day': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'night': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'event': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const scheduledShifts = shifts.filter(s => s.status === 'scheduled').length;
  const inProgressShifts = shifts.filter(s => s.status === 'in-progress').length;
  const completedShifts = shifts.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Schedule & Shifts</h2>
          <p className="text-slate-400 text-sm mt-1">Manage officer schedules and assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{shifts.length}</p>
          <p className="text-slate-400 text-sm">Total Shifts</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{scheduledShifts}</p>
          <p className="text-slate-400 text-sm">Scheduled</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{inProgressShifts}</p>
          <p className="text-slate-400 text-sm">In Progress</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{completedShifts}</p>
          <p className="text-slate-400 text-sm">Completed</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white font-medium px-4">December 2024</span>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {['day', 'week', 'month'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(mode as any)}
                  className={viewMode === mode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Week Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <p className="text-slate-400 text-xs font-medium mb-1">{day}</p>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 2 ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}>
                  {9 + index}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 pt-4 space-y-2">
            {shifts.map((shift) => (
              <div 
                key={shift.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{shift.officerName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {shift.startTime} - {shift.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {shift.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(shift.type)}>{shift.type}</Badge>
                  <Badge className={getStatusColor(shift.status)}>{shift.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-white font-medium">Quick Schedule</h3>
            <p className="text-slate-400 text-sm mt-1">Create a new shift quickly</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-white font-medium">Recurring Shifts</h3>
            <p className="text-slate-400 text-sm mt-1">Set up repeating schedules</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center mb-3">
              <Filter className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-white font-medium">Availability</h3>
            <p className="text-slate-400 text-sm mt-1">View officer availability</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMSchedule;
