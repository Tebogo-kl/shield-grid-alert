import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Building2,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'prospect';
  contractValue: number;
  servicesCount: number;
}
const API_BASE_URL = 'https://localhost:44339/api';


const mockClients: Client[] = [
  {
    id: '1',
    name: 'ABC Corporation',
    contactPerson: 'John Smith',
    email: 'john@abccorp.com',
    phone: '+27 11 123 4567',
    address: 'Sandton, Johannesburg',
    status: 'active',
    contractValue: 45000,
    servicesCount: 3
  },
  {
    id: '2',
    name: 'XYZ Mall',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@xyzmall.co.za',
    phone: '+27 11 987 6543',
    address: 'Rosebank, Johannesburg',
    status: 'active',
    contractValue: 85000,
    servicesCount: 5
  },
  {
    id: '3',
    name: 'Hotel Grand',
    contactPerson: 'Mike Williams',
    email: 'mike@hotelgrand.com',
    phone: '+27 12 555 1234',
    address: 'Pretoria CBD',
    status: 'prospect',
    contractValue: 0,
    servicesCount: 0
  },
  {
    id: '4',
    name: 'Tech Park Estate',
    contactPerson: 'Lisa Brown',
    email: 'lisa@techpark.co.za',
    phone: '+27 11 444 5678',
    address: 'Midrand',
    status: 'active',
    contractValue: 120000,
    servicesCount: 8
  },
];

const CRMClients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients] = useState<Client[]>(mockClients);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'prospect': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const totalRevenue = clients.reduce((sum, c) => sum + c.contractValue, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const prospects = clients.filter(c => c.status === 'prospect').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Clients</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your client relationships</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{clients.length}</p>
          <p className="text-slate-400 text-sm">Total Clients</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{activeClients}</p>
          <p className="text-slate-400 text-sm">Active</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{prospects}</p>
          <p className="text-slate-400 text-sm">Prospects</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">R{(totalRevenue / 1000).toFixed(0)}k</p>
          <p className="text-slate-400 text-sm">Monthly Value</p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{client.name}</h3>
                    <p className="text-sm text-slate-400">{client.contactPerson}</p>
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
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Badge className={getStatusColor(client.status)}>
                {client.status}
              </Badge>

              <div className="space-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3 w-3" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-3 w-3" />
                  <span>{client.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-white font-semibold">R{client.contractValue.toLocaleString()}</span>
                  <span className="text-xs">/month</span>
                </div>
                <div className="text-xs text-slate-500">
                  {client.servicesCount} services
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CRMClients;
