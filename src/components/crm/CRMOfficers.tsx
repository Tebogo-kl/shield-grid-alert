import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Officer {
  id: string;
  name: string;
  badge: string;
  phone: string;
  email: string;
  status: 'active' | 'off-duty' | 'on-patrol';
  location: string;
  certification: string;
  joinDate: string;
}

interface CRMOfficersProps {
  officers: Officer[];
  onAddOfficer: () => void;
  onDeleteOfficer: (id: string) => void;
  officerVerifications: Record<string, { open: boolean; psira: string; verified: boolean }>;
  setOfficerVerifications: React.Dispatch<React.SetStateAction<Record<string, { open: boolean; psira: string; verified: boolean }>>>;
  onVerifyOfficer: (id: string) => void;
  onOpenAIVerification?: (officerId: string) => void; // New prop
}

const CRMOfficers: React.FC<CRMOfficersProps> = ({
  officers,
  onAddOfficer,
  onDeleteOfficer,
  officerVerifications,
  setOfficerVerifications,
  onVerifyOfficer,
  onOpenAIVerification // Destructure new prop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          officer.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'off-duty': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'on-patrol': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const toggleOfficerVerification = (officerId: string) => {
    setOfficerVerifications({
      ...officerVerifications,
      [officerId]: {
        open: !officerVerifications[officerId]?.open,
        psira: officerVerifications[officerId]?.psira || '',
        verified: officerVerifications[officerId]?.verified || false
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Officers</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your security team</p>
        </div>
        <Button onClick={onAddOfficer} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search officers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'on-patrol', 'off-duty'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{officers.length}</p>
          <p className="text-slate-400 text-sm">Total</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{officers.filter(o => o.status === 'active').length}</p>
          <p className="text-slate-400 text-sm">Active</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{officers.filter(o => o.status === 'on-patrol').length}</p>
          <p className="text-slate-400 text-sm">On Patrol</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{officers.filter(o => o.status === 'off-duty').length}</p>
          <p className="text-slate-400 text-sm">Off Duty</p>
        </div>
      </div>

      {/* Officers Grid */}
      {filteredOfficers.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No officers found. Add your first officer to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOfficers.map((officer) => {
            const verification = officerVerifications[officer.id] || { open: false, psira: '', verified: false };
            return (
              <Card key={officer.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{officer.name}</h3>
                        <p className="text-sm text-slate-400">Badge: {officer.badge}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-700"
                          onClick={() => onDeleteOfficer(officer.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStatusColor(officer.status)}>
                      {officer.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={verification.verified 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {verification.verified ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> PSIRA Verified</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3 w-3" />
                      <span>{officer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span>{officer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>{officer.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                      {officer.certification} • Joined {officer.joinDate}
                    </p>
                  </div>

                  {/* AI Verification Button */}
                  {onOpenAIVerification && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => onOpenAIVerification(officer.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Compliance Check
                      </Button>
                    </div>
                  )}

                  {/* Manual PSIRA Verification (Original) */}
                  <div className="mt-3">
                    <Collapsible open={verification.open} onOpenChange={() => toggleOfficerVerification(officer.id)}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-between border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          Manual PSIRA Verify
                          {verification.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`psira-${officer.id}`} className="text-slate-400 text-xs">PSIRA Number</Label>
                            <Input
                              id={`psira-${officer.id}`}
                              value={verification.psira}
                              onChange={(e) => setOfficerVerifications({
                                ...officerVerifications,
                                [officer.id]: { ...verification, psira: e.target.value }
                              })}
                              placeholder="Enter PSIRA number"
                              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                          </div>
                          <Button 
                            onClick={() => onVerifyOfficer(officer.id)}
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Verify
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CRMOfficers;