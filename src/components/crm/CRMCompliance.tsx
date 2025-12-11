import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface CRMComplianceProps {
  companyPsiraOpen: boolean;
  setCompanyPsiraOpen: (open: boolean) => void;
  companyPsiraNumber: string;
  setCompanyPsiraNumber: (value: string) => void;
  companyVerified: boolean;
  onVerifyCompany: () => void;
}

const CRMCompliance: React.FC<CRMComplianceProps> = ({
  companyPsiraOpen,
  setCompanyPsiraOpen,
  companyPsiraNumber,
  setCompanyPsiraNumber,
  companyVerified,
  onVerifyCompany
}) => {
  const { toast } = useToast();

  const complianceItems = [
    { id: 1, name: 'PSIRA Company Registration', status: companyVerified ? 'compliant' : 'pending', expiryDate: '2025-12-31', type: 'license' },
    { id: 2, name: 'Public Liability Insurance', status: 'compliant', expiryDate: '2025-06-30', type: 'insurance' },
    { id: 3, name: 'Workers Compensation', status: 'compliant', expiryDate: '2025-03-15', type: 'insurance' },
    { id: 4, name: 'BEE Certificate', status: 'expiring', expiryDate: '2024-12-31', type: 'certificate' },
    { id: 5, name: 'Tax Clearance Certificate', status: 'compliant', expiryDate: '2025-09-30', type: 'certificate' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'pending': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'expiring': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'pending': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const compliantCount = complianceItems.filter(i => i.status === 'compliant').length;
  const expiringCount = complianceItems.filter(i => i.status === 'expiring').length;
  const pendingCount = complianceItems.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Compliance & Certifications</h2>
        <p className="text-slate-400 text-sm mt-1">Manage PSIRA and regulatory compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{compliantCount}</p>
            <p className="text-slate-400 text-sm">Compliant</p>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{expiringCount}</p>
            <p className="text-slate-400 text-sm">Expiring Soon</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{pendingCount}</p>
            <p className="text-slate-400 text-sm">Action Required</p>
          </div>
        </div>
      </div>

      {/* Company PSIRA Verification */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-400" />
              Company PSIRA Registration
            </span>
            <Badge className={companyVerified 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'}>
              {companyVerified ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={companyPsiraOpen} onOpenChange={setCompanyPsiraOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                {companyVerified ? 'Update PSIRA Number' : 'Verify Company PSIRA Number'}
                {companyPsiraOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <Label htmlFor="company-psira" className="text-slate-300">PSIRA Registration Number</Label>
                  <Input
                    id="company-psira"
                    value={companyPsiraNumber}
                    onChange={(e) => setCompanyPsiraNumber(e.target.value)}
                    placeholder="Enter company PSIRA number"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button 
                  onClick={onVerifyCompany}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Verify
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Compliance Items List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-400" />
            All Compliance Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-slate-400 text-sm">Expires: {item.expiryDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    {item.status === 'pending' ? 'Upload' : 'View'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMCompliance;
