// components/PsiraComplianceWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { isPsiraExpiringSoon, isPsiraExpired } from '@/utils/psiraHelpers';

interface ComplianceStats {
  totalOfficers: number;
  verifiedOfficers: number;
  expiringSoon: number;
  expired: number;
  notVerified: number;
}

interface PsiraComplianceWidgetProps {
  officers: Array<{
    id: string;
    isPsiraVerified: boolean;
    psiraCertificateExpiry?: string;
  }>;
  companyVerified: boolean;
}

const PsiraComplianceWidget: React.FC<PsiraComplianceWidgetProps> = ({ officers, companyVerified }) => {
  const stats: ComplianceStats = {
    totalOfficers: officers.length,
    verifiedOfficers: officers.filter(o => o.isPsiraVerified).length,
    expiringSoon: officers.filter(o => isPsiraExpiringSoon(o.psiraCertificateExpiry || null)).length,
    expired: officers.filter(o => isPsiraExpired(o.psiraCertificateExpiry || null)).length,
    notVerified: officers.filter(o => !o.isPsiraVerified).length
  };

  const compliancePercentage = stats.totalOfficers > 0 
    ? Math.round((stats.verifiedOfficers / stats.totalOfficers) * 100)
    : 0;

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">PSIRA Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-white/70">Company Verification</span>
          <Badge className={companyVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
            {companyVerified ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
            )}
          </Badge>
        </div>

        {/* Officer Compliance */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Officer Compliance</span>
            <span className="text-white font-bold">{compliancePercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-white/70 text-sm">Verified</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.verifiedOfficers}</p>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-white/70 text-sm">Not Verified</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.notVerified}</p>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-white/70 text-sm">Expiring Soon</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.expiringSoon}</p>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-white/70 text-sm">Expired</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.expired}</p>
          </div>
        </div>

        {/* Alerts */}
        {(stats.expired > 0 || stats.expiringSoon > 0) && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                {stats.expired > 0 && (
                  <p className="font-semibold">{stats.expired} officer(s) have expired PSIRA certificates</p>
                )}
                {stats.expiringSoon > 0 && (
                  <p>{stats.expiringSoon} officer(s) certificates expiring within 30 days</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PsiraComplianceWidget;