import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Briefcase, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3,
  Building,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CRMSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName?: string;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'officers', label: 'Officers', icon: Shield },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'compliance', label: 'Compliance', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const CRMSidebar: React.FC<CRMSidebarProps> = ({ activeTab, setActiveTab, companyName }) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 min-h-screen flex flex-col">
      {/* Company Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm truncate max-w-[140px]">
              {companyName || 'Security CRM'}
            </h2>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              Active Jobs
            </span>
            <span className="text-white font-semibold">12</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              Pending
            </span>
            <span className="text-white font-semibold">5</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CRMSidebar;
