import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Shield,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CRMReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');

  const kpiCards = [
    { 
      title: 'Total Revenue', 
      value: 'R485,000', 
      change: '+12.5%', 
      trend: 'up', 
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'Active Contracts', 
      value: '24', 
      change: '+3', 
      trend: 'up', 
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Officer Utilization', 
      value: '87%', 
      change: '+5%', 
      trend: 'up', 
      icon: Shield,
      color: 'from-violet-500 to-purple-500'
    },
    { 
      title: 'Client Retention', 
      value: '94%', 
      change: '-2%', 
      trend: 'down', 
      icon: Users,
      color: 'from-amber-500 to-orange-500'
    },
  ];

  const recentReports = [
    { id: 1, name: 'Monthly Performance Report', date: 'Dec 1, 2024', type: 'Performance', status: 'Ready' },
    { id: 2, name: 'Revenue Analysis Q4', date: 'Nov 30, 2024', type: 'Financial', status: 'Ready' },
    { id: 3, name: 'Officer Attendance Report', date: 'Nov 28, 2024', type: 'HR', status: 'Ready' },
    { id: 4, name: 'Client Satisfaction Survey', date: 'Nov 25, 2024', type: 'Client', status: 'Pending' },
    { id: 5, name: 'Incident Summary November', date: 'Nov 30, 2024', type: 'Operations', status: 'Ready' },
  ];

  const topClients = [
    { name: 'Tech Park Estate', revenue: 120000, contracts: 8 },
    { name: 'XYZ Mall', revenue: 85000, contracts: 5 },
    { name: 'ABC Corporation', revenue: 45000, contracts: 3 },
    { name: 'Hotel Grand', revenue: 35000, contracts: 2 },
  ];

  const topOfficers = [
    { name: 'John Doe', completedJobs: 45, rating: 4.9, hoursWorked: 180 },
    { name: 'Jane Smith', completedJobs: 42, rating: 4.8, hoursWorked: 176 },
    { name: 'Mike Johnson', completedJobs: 38, rating: 4.7, hoursWorked: 168 },
    { name: 'Sarah Williams', completedJobs: 35, rating: 4.9, hoursWorked: 160 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Track performance and generate insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week" className="text-slate-300 focus:bg-slate-700 focus:text-white">This Week</SelectItem>
              <SelectItem value="month" className="text-slate-300 focus:bg-slate-700 focus:text-white">This Month</SelectItem>
              <SelectItem value="quarter" className="text-slate-300 focus:bg-slate-700 focus:text-white">This Quarter</SelectItem>
              <SelectItem value="year" className="text-slate-300 focus:bg-slate-700 focus:text-white">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{kpi.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-xs ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[65, 40, 80, 55, 95, 70, 85, 60, 90, 75, 88, 92].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-400" />
              Jobs by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Armed Response', count: 12, percentage: 35, color: 'bg-red-500' },
                { type: 'Patrol', count: 8, percentage: 24, color: 'bg-blue-500' },
                { type: 'Event Security', count: 6, percentage: 18, color: 'bg-amber-500' },
                { type: 'Escort', count: 5, percentage: 15, color: 'bg-purple-500' },
                { type: 'Surveillance', count: 3, percentage: 8, color: 'bg-cyan-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.type}</span>
                    <span className="text-slate-400">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-400" />
              Top Clients by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{client.name}</p>
                      <p className="text-slate-400 text-xs">{client.contracts} contracts</p>
                    </div>
                  </div>
                  <p className="text-emerald-400 font-semibold">R{client.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Officers */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Top Performing Officers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOfficers.map((officer, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{officer.name}</p>
                      <p className="text-slate-400 text-xs">{officer.hoursWorked}h worked</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{officer.completedJobs} jobs</p>
                    <p className="text-amber-400 text-xs">⭐ {officer.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-400" />
              Recent Reports
            </CardTitle>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{report.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-xs">{report.date}</span>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={report.status === 'Ready' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                    {report.status}
                  </Badge>
                  {report.status === 'Ready' && (
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMReports;
