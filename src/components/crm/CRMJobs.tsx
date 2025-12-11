import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar,
  MapPin,
  User,
  Clock,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Job {
  id: string;
  title: string;
  client: string;
  type: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  assignedOfficer: string;
  location: string;
  startDate: string;
  endDate: string;
  value: number;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Executive Protection',
    client: 'ABC Corporation',
    type: 'Escort',
    status: 'active',
    assignedOfficer: 'John Doe',
    location: 'Sandton',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    value: 25000
  },
  {
    id: '2',
    title: 'Night Patrol',
    client: 'XYZ Mall',
    type: 'Patrol',
    status: 'active',
    assignedOfficer: 'Jane Smith',
    location: 'Rosebank',
    startDate: '2024-11-15',
    endDate: '2025-01-15',
    value: 18000
  },
  {
    id: '3',
    title: 'Event Security - Conference',
    client: 'Hotel Grand',
    type: 'Event Security',
    status: 'pending',
    assignedOfficer: 'Unassigned',
    location: 'Pretoria',
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    value: 12000
  },
  {
    id: '4',
    title: 'CCTV Monitoring',
    client: 'Tech Park Estate',
    type: 'Surveillance',
    status: 'completed',
    assignedOfficer: 'Mike Johnson',
    location: 'Midrand',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    value: 8000
  },
  {
    id: '5',
    title: 'Armed Response Retainer',
    client: 'ABC Corporation',
    type: 'Armed Response',
    status: 'active',
    assignedOfficer: 'Team Alpha',
    location: 'Sandton',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    value: 35000
  },
];

const CRMJobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobs] = useState<Job[]>(mockJobs);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Armed Response': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Patrol': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Escort': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Event Security': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Surveillance': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const totalValue = jobs.filter(j => j.status === 'active').reduce((sum, j) => sum + j.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Jobs & Contracts</h2>
          <p className="text-slate-400 text-sm mt-1">Track all security assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['all', 'active', 'pending', 'completed', 'cancelled'].map((status) => {
          const count = status === 'all' ? jobs.length : jobs.filter(j => j.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`bg-slate-800/50 border rounded-lg p-4 text-center transition-all ${
                statusFilter === status 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-slate-400 text-sm capitalize">{status}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Active Jobs Value</p>
              <p className="text-lg font-bold text-emerald-400">R{totalValue.toLocaleString()}/mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    <Badge className={getTypeColor(job.type)} variant="outline">
                      {job.type}
                    </Badge>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{job.client}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{job.assignedOfficer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{job.startDate} - {job.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Contract Value</p>
                    <p className="text-lg font-bold text-white">R{job.value.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CRMJobs;
