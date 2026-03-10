import React, { useState } from 'react';
import { 
  Briefcase, Plus, Search, Calendar, MapPin, User, Clock, X, ArrowLeft, Edit, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

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
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
}

const initialJobs: Job[] = [
  { id: '1', title: 'Executive Protection', client: 'ABC Corporation', type: 'Escort', status: 'active', assignedOfficer: 'John Doe', location: 'Sandton', startDate: '2024-12-01', endDate: '2024-12-31', value: 25000, description: 'VIP executive protection detail for CEO.', contactPhone: '011-555-0100', contactEmail: 'ceo@abccorp.co.za' },
  { id: '2', title: 'Night Patrol', client: 'XYZ Mall', type: 'Patrol', status: 'active', assignedOfficer: 'Jane Smith', location: 'Rosebank', startDate: '2024-11-15', endDate: '2025-01-15', value: 18000, description: 'Nightly patrol of mall premises.', contactPhone: '011-555-0200', contactEmail: 'security@xyzmall.co.za' },
  { id: '3', title: 'Event Security - Conference', client: 'Hotel Grand', type: 'Event Security', status: 'pending', assignedOfficer: 'Unassigned', location: 'Pretoria', startDate: '2024-12-20', endDate: '2024-12-22', value: 12000, description: 'Security for annual business conference.', contactPhone: '012-555-0300', contactEmail: 'events@hotelgrand.co.za' },
  { id: '4', title: 'CCTV Monitoring', client: 'Tech Park Estate', type: 'Surveillance', status: 'completed', assignedOfficer: 'Mike Johnson', location: 'Midrand', startDate: '2024-11-01', endDate: '2024-11-30', value: 8000, description: '24/7 CCTV monitoring of tech park.', contactPhone: '011-555-0400', contactEmail: 'admin@techpark.co.za' },
  { id: '5', title: 'Armed Response Retainer', client: 'ABC Corporation', type: 'Armed Response', status: 'active', assignedOfficer: 'Team Alpha', location: 'Sandton', startDate: '2024-01-01', endDate: '2024-12-31', value: 35000, description: 'Ongoing armed response retainer contract.', contactPhone: '011-555-0100', contactEmail: 'security@abccorp.co.za' },
];

const jobTypes = ['Armed Response', 'Patrol', 'Escort', 'Event Security', 'Surveillance'];

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

// ─── Create Job Form ───
const CreateJobForm: React.FC<{ onSubmit: (job: Job) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ title: '', client: '', type: '', assignedOfficer: '', location: '', startDate: '', endDate: '', value: '', description: '', contactPhone: '', contactEmail: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Date.now().toString(),
      ...form,
      value: parseFloat(form.value) || 0,
      status: 'pending',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400 hover:text-white hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-white">Create New Job</h2>
      </div>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-slate-300">Job Title *</Label>
                <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Executive Protection" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Client Name *</Label>
                <Input required value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="e.g. ABC Corporation" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Job Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Assigned Officer</Label>
                <Input value={form.assignedOfficer} onChange={e => setForm({...form, assignedOfficer: e.target.value})} placeholder="Officer name or team" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Location *</Label>
                <Input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Sandton" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contract Value (R)</Label>
                <Input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="0" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date *</Label>
                <Input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="bg-slate-700/50 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date *</Label>
                <Input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="bg-slate-700/50 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Phone</Label>
                <Input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} placeholder="011-555-0000" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Email</Label>
                <Input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} placeholder="email@example.com" className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Job details and requirements..." className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Job</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Job Detail View ───
const JobDetailView: React.FC<{ job: Job; onBack: () => void; onDelete: (id: string) => void }> = ({ job, onBack, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-white">{job.title}</h2>
          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => onDelete(job.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Job Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {job.description && <p className="text-slate-300 text-sm">{job.description}</p>}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { icon: Briefcase, label: 'Client', value: job.client },
                { icon: User, label: 'Assigned Officer', value: job.assignedOfficer || 'Unassigned' },
                { icon: MapPin, label: 'Location', value: job.location },
                { icon: Calendar, label: 'Start Date', value: job.startDate },
                { icon: Calendar, label: 'End Date', value: job.endDate },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <item.icon className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-sm text-white font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Info */}
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white text-sm">Contract Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Value</span>
                <span className="text-emerald-400 font-bold text-lg">R{job.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Type</span>
                <Badge className={getTypeColor(job.type)} variant="outline">{job.type}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white text-sm">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.contactPhone && (
                <div><p className="text-slate-400 text-xs">Phone</p><p className="text-white">{job.contactPhone}</p></div>
              )}
              {job.contactEmail && (
                <div><p className="text-slate-400 text-xs">Email</p><p className="text-white">{job.contactEmail}</p></div>
              )}
              {!job.contactPhone && !job.contactEmail && <p className="text-slate-500 italic">No contact info available</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───
const CRMJobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
    setView('list');
  };

  const handleDeleteJob = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    setView('list');
  };

  if (view === 'create') return <CreateJobForm onSubmit={handleCreateJob} onCancel={() => setView('list')} />;
  if (view === 'detail' && selectedJob) return <JobDetailView job={selectedJob} onBack={() => setView('list')} onDelete={handleDeleteJob} />;

  const totalValue = jobs.filter(j => j.status === 'active').reduce((sum, j) => sum + j.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Jobs & Contracts</h2>
          <p className="text-slate-400 text-sm mt-1">Track all security assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setView('create')}>
          <Plus className="h-4 w-4 mr-2" /> Create Job
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['all', 'active', 'pending', 'completed', 'cancelled'].map((status) => {
          const count = status === 'all' ? jobs.length : jobs.filter(j => j.status === status).length;
          return (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`bg-slate-800/50 border rounded-lg p-4 text-center transition-all ${statusFilter === status ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-slate-400 text-sm capitalize">{status}</p>
            </button>
          );
        })}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search jobs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" />
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Active Jobs Value</p>
              <p className="text-lg font-bold text-emerald-400">R{totalValue.toLocaleString()}/mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    <Badge className={getTypeColor(job.type)} variant="outline">{job.type}</Badge>
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1"><Briefcase className="h-3 w-3" /><span>{job.client}</span></div>
                    <div className="flex items-center gap-1"><User className="h-3 w-3" /><span>{job.assignedOfficer}</span></div>
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span>{job.location}</span></div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{job.startDate} - {job.endDate}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Contract Value</p>
                    <p className="text-lg font-bold text-white">R{job.value.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedJob(job); setView('detail'); }}
                    className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMJobs;
