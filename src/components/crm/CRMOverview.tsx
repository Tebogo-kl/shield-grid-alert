import React from 'react';
import { 
  Users, 
  Shield, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Officer {
  id: string;
  name: string;
  status: 'active' | 'off-duty' | 'on-patrol';
}

interface CRMOverviewProps {
  officers: Officer[];
}

const CRMOverview: React.FC<CRMOverviewProps> = ({ officers }) => {
  const activeOfficers = officers.filter(o => o.status === 'active').length;
  const onPatrolOfficers = officers.filter(o => o.status === 'on-patrol').length;

  const stats = [
    {
      title: 'Total Officers',
      value: officers.length,
      change: '+2 this month',
      trend: 'up',
      icon: Shield,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Clients',
      value: 24,
      change: '+3 this month',
      trend: 'up',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Active Jobs',
      value: 18,
      change: '5 pending',
      trend: 'neutral',
      icon: Briefcase,
      color: 'from-violet-500 to-violet-600'
    },
    {
      title: 'Revenue (MTD)',
      value: 'R245,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const recentJobs = [
    { id: 1, client: 'ABC Corporation', type: 'Armed Response', status: 'active', officer: 'John Doe', location: 'Sandton' },
    { id: 2, client: 'XYZ Mall', type: 'Patrol', status: 'completed', officer: 'Jane Smith', location: 'Rosebank' },
    { id: 3, client: 'Hotel Grand', type: 'Event Security', status: 'pending', officer: 'Unassigned', location: 'Pretoria' },
    { id: 4, client: 'Tech Park', type: 'Surveillance', status: 'active', officer: 'Mike Johnson', location: 'Midrand' },
  ];

  const upcomingSchedule = [
    { time: '08:00', event: 'Shift Change - Morning Team', type: 'shift' },
    { time: '10:00', event: 'Client Meeting - XYZ Corp', type: 'meeting' },
    { time: '14:00', event: 'Officer Training Session', type: 'training' },
    { time: '18:00', event: 'Shift Change - Evening Team', type: 'shift' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-400" />}
                      {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Officer Status & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officer Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Officer Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Active</span>
              </div>
              <span className="text-2xl font-bold text-green-400">{activeOfficers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-300 font-medium">On Patrol</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">{onPatrolOfficers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-300 font-medium">Off Duty</span>
              </div>
              <span className="text-2xl font-bold text-slate-400">
                {officers.filter(o => o.status === 'off-duty').length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-violet-400" />
                Recent Jobs
              </CardTitle>
              <button className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{job.client}</span>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {job.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {job.officer} • {job.location}
                    </p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedule.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-cyan-400 font-mono font-medium text-sm w-12">
                    {item.time}
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div>
                    <p className="text-white text-sm font-medium">{item.event}</p>
                    <p className="text-slate-400 text-xs capitalize">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">3 Officer Certifications Expiring</p>
                  <p className="text-slate-400 text-xs mt-1">Review and renew within 30 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Monthly Report Ready</p>
                  <p className="text-slate-400 text-xs mt-1">November 2024 performance report</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">New Client Inquiry</p>
                  <p className="text-slate-400 text-xs mt-1">Metro Hotel requesting quote</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMOverview;
