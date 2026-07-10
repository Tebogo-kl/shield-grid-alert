import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Search, Calendar, MapPin, User, Clock, X, ArrowLeft, Edit, Trash2, Loader2
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

const API_BASE_URL = 'https://localhost:44339/api';

interface Job {
  id: string;
  jobTitle: string;
  clientName: string;
  jobType: string;
  assignedOfficer: string;
  location: string;
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  clientContactNumber: string;
  clientEmailAddress: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
}

interface CreateJobDto {
  jobTitle: string;
  clientName: string;
  serviceType: string;
  officerOnDuty: string;
  clientLocation: string;
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  clientContactNumber: string;
  clientEmailAddress: string;
}

interface JobsResponse {
  id: string;
  ownerId: string;
  companyName: string;
  serviceType: string;
  estimatedDuration: string;
  incidents: string;
  reports: string;
  clientName: string;
  clientContactNumber: string;
  clientEmailAddress: string;
  clientLocation: string;
  officerOnDuty: string;
  createdAt: string;
  updatedAt: string;
}

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
const CreateJobForm: React.FC<{ onSubmit: (job: CreateJobDto) => Promise<void>; onCancel: () => void; isLoading: boolean }> = 
  ({ onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState<CreateJobDto>({
    jobTitle: '',
    clientName: '',
    serviceType: '',
    officerOnDuty: '',
    clientLocation: '',
    startDate: '',
    endDate: '',
    value: 0,
    description: '',
    clientContactNumber: '',
    clientEmailAddress: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
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
                <Input 
                  required 
                  value={form.jobTitle} 
                  onChange={e => setForm({...form, jobTitle: e.target.value})} 
                  placeholder="e.g. Executive Protection" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Client Name *</Label>
                <Input 
                  required 
                  value={form.clientName} 
                  onChange={e => setForm({...form, clientName: e.target.value})} 
                  placeholder="e.g. ABC Corporation" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Job Type *</Label>
                <Select value={form.serviceType} onValueChange={v => setForm({...form, serviceType: v})}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Assigned Officer</Label>
                <Input 
                value={form.officerOnDuty} 
                  onChange={e => setForm({...form, officerOnDuty: e.target.value})} 
                  placeholder="Officer name or team" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Location *</Label>
                <Input 
                  required 
                  value={form.clientLocation} 
                  onChange={e => setForm({...form, clientLocation: e.target.value})} 
                  placeholder="e.g. Sandton" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contract Value (R)</Label>
                <Input 
                  type="number" 
                  value={form.value || ''} 
                  onChange={e => setForm({...form, value: parseFloat(e.target.value) || 0})} 
                  placeholder="0" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date *</Label>
                <Input 
                  required 
                  type="date" 
                  value={form.startDate} 
                  onChange={e => setForm({...form, startDate: e.target.value})} 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date *</Label>
                <Input 
                  required 
                  type="date" 
                  value={form.endDate} 
                  onChange={e => setForm({...form, endDate: e.target.value})} 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Phone</Label>
                <Input 
                  value={form.clientContactNumber} 
                  onChange={e => setForm({...form, clientContactNumber: e.target.value})} 
                  placeholder="011-555-0000" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Email</Label>
                <Input 
                  type="email" 
                  value={form.clientEmailAddress} 
                  onChange={e => setForm({...form, clientEmailAddress: e.target.value})} 
                  placeholder="email@example.com" 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                placeholder="Job details and requirements..." 
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]" 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? 'Creating...' : 'Create Job'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Job Detail View ───
const JobDetailView: React.FC<{ job: Job; onBack: () => void; onDelete: (id: string) => Promise<void>; isLoading: boolean }> = 
  ({ job, onBack, onDelete, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-white">{job.jobTitle}</h2>
          <Badge className={getStatusColor(job.status || 'pending')}>{job.status || 'pending'}</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(job.id)} 
          disabled={isLoading}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
          {isLoading ? 'Deleting...' : 'Delete'}
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
                { icon: Briefcase, label: 'Client', value: job.clientName },
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
                <Badge className={getTypeColor(job.jobType)} variant="outline">{job.jobType}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white text-sm">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.clientContactNumber && (
                <div><p className="text-slate-400 text-xs">Phone</p><p className="text-white">{job.clientContactNumber}</p></div>
              )}
              {job.clientEmailAddress && (
                <div><p className="text-slate-400 text-xs">Email</p><p className="text-white">{job.clientEmailAddress}</p></div>
              )}
              {!job.clientContactNumber && !job.clientEmailAddress && <p className="text-slate-500 italic">No contact info available</p>}
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data: JobsResponse[] = await response.json();
      
      // Transform API response to Job interface
      const transformedJobs: Job[] = data.map(item => ({
        id: item.id,
        jobTitle: item.companyName, // Map companyName to jobTitle (you might want to add jobTitle to your entity)
        clientName: item.clientName,
        jobType: item.serviceType,
        assignedOfficer: item.officerOnDuty,
        location: item.clientLocation,
        startDate: item.createdAt.split('T')[0], // You'll need to store startDate in your entity
        endDate: item.updatedAt.split('T')[0], // You'll need to store endDate in your entity
        value: 0, // You'll need to add value to your entity
        description: '', // You'll need to add description to your entity
        clientContactNumber: item.clientContactNumber,
        clientEmailAddress: item.clientEmailAddress,
        status: 'active' // Default status
      }));
      
      setJobs(transformedJobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (createJobDto: CreateJobDto) => {
    try {
      setSubmitting(true);
      // Replace with actual ownerId from your auth system
      const ownerId = '12345678-1234-1234-1234-123456789012';
      
      const response = await fetch(`${API_BASE_URL}/RegisterClient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createJobDto),
      });
      
      if (!response.ok) throw new Error('Failed to create job');
      
      const newJob: JobsResponse = await response.json();
      
      // Transform response to Job interface
      const transformedJob: Job = {
        id: newJob.id,
        jobTitle: createJobDto.jobTitle,
        clientName: createJobDto.clientName,
        jobType: createJobDto.serviceType,
        assignedOfficer: createJobDto.officerOnDuty,
        location: createJobDto.clientLocation,
        startDate: createJobDto.startDate,
        endDate: createJobDto.endDate,
        value: createJobDto.value,
        description: createJobDto.description,
        clientContactNumber: createJobDto.clientContactNumber,
        clientEmailAddress: createJobDto.clientEmailAddress,
        status: 'pending'
      };
      
      setJobs(prev => [transformedJob, ...prev]);
      setView('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      console.error('Error creating job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`${API_BASE_URL}/Jobs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete job');
      
      setJobs(prev => prev.filter(j => j.id !== id));
      setView('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      console.error('Error deleting job:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = jobs.filter(j => j.status === 'active').reduce((sum, j) => sum + j.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (view === 'create') {
    return <CreateJobForm onSubmit={handleCreateJob} onCancel={() => setView('list')} isLoading={submitting} />;
  }
  
  if (view === 'detail' && selectedJob) {
    return <JobDetailView job={selectedJob} onBack={() => setView('list')} onDelete={handleDeleteJob} isLoading={deleting} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p>Error: {error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-2">
            Dismiss
          </Button>
        </div>
      )}
      
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
            <button 
              key={status} 
              onClick={() => setStatusFilter(status)}
              className={`bg-slate-800/50 border rounded-lg p-4 text-center transition-all ${statusFilter === status ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}`}
            >
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

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{job.jobTitle}</h3>
                    <Badge className={getTypeColor(job.jobType)} variant="outline">{job.jobType}</Badge>
                    <Badge className={getStatusColor(job.status || 'pending')}>{job.status || 'pending'}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1"><Briefcase className="h-3 w-3" /><span>{job.clientName}</span></div>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setSelectedJob(job); setView('detail'); }}
                    className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
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