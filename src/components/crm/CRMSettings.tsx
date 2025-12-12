import React, { useState } from 'react';
import { 
  Settings, 
  Building,
  Bell,
  Shield,
  Users,
  CreditCard,
  Mail,
  Lock,
  Save,
  Upload,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CRMSettingsProps {
  companyName?: string;
}

const CRMSettings: React.FC<CRMSettingsProps> = ({ companyName }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  
  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    name: companyName || 'Security Company',
    email: 'info@securitycompany.co.za',
    phone: '+27 11 123 4567',
    address: 'Johannesburg, South Africa',
    website: 'www.securitycompany.co.za',
    description: 'Professional security services for businesses and individuals.',
    registrationNumber: 'REG-123456',
    vatNumber: 'VAT-987654'
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    jobUpdates: true,
    clientMessages: true,
    complianceReminders: true,
    dailyDigest: false,
    weeklyReport: true
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your company profile and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger 
            value="company" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            <Building className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-400" />
                Company Profile
              </CardTitle>
              <CardDescription className="text-slate-400">
                Update your company information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Building className="h-10 w-10 text-white" />
                </div>
                <div>
                  <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-slate-500 text-xs mt-2">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name" className="text-slate-300">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-slate-300">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-slate-300">Address</Label>
                  <Input
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-slate-300">Company Description</Label>
                  <Textarea
                    id="description"
                    value={companySettings.description}
                    onChange={(e) => setCompanySettings({...companySettings, description: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-number" className="text-slate-300">Registration Number</Label>
                  <Input
                    id="reg-number"
                    value={companySettings.registrationNumber}
                    onChange={(e) => setCompanySettings({...companySettings, registrationNumber: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="vat-number" className="text-slate-300">VAT Number</Label>
                  <Input
                    id="vat-number"
                    value={companySettings.vatNumber}
                    onChange={(e) => setCompanySettings({...companySettings, vatNumber: e.target.value})}
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose how you want to receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { id: 'emailAlerts', label: 'Email Alerts', description: 'Receive important notifications via email', icon: Mail },
                  { id: 'smsAlerts', label: 'SMS Alerts', description: 'Get text messages for urgent updates', icon: Bell },
                  { id: 'jobUpdates', label: 'Job Updates', description: 'Notifications about job status changes', icon: Shield },
                  { id: 'clientMessages', label: 'Client Messages', description: 'Alerts when clients send messages', icon: Users },
                  { id: 'complianceReminders', label: 'Compliance Reminders', description: 'Reminders for expiring documents', icon: Shield },
                  { id: 'dailyDigest', label: 'Daily Digest', description: 'Summary email at end of each day', icon: Mail },
                  { id: 'weeklyReport', label: 'Weekly Report', description: 'Performance summary every week', icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-slate-400 text-sm">{item.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications[item.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications({...notifications, [item.id]: checked})}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-400" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your account security and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-slate-400 text-sm">Update your account password</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                      Change
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                      Enable
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Active Sessions</p>
                      <p className="text-slate-400 text-sm">Manage your active login sessions</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                      View
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">API Keys</p>
                      <p className="text-slate-400 text-sm">Manage integration access tokens</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                Billing & Subscription
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Current Plan</p>
                    <p className="text-2xl font-bold text-white mt-1">Professional</p>
                    <p className="text-slate-400 text-sm mt-2">R2,500/month • Up to 50 officers</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Plan
                  </Button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-600 rounded flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">•••• •••• •••• 4242</p>
                      <p className="text-slate-400 text-sm">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                    Update
                  </Button>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <h3 className="text-white font-medium mb-4">Billing History</h3>
                <div className="space-y-2">
                  {[
                    { date: 'Dec 1, 2024', amount: 'R2,500', status: 'Paid' },
                    { date: 'Nov 1, 2024', amount: 'R2,500', status: 'Paid' },
                    { date: 'Oct 1, 2024', amount: 'R2,500', status: 'Paid' },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">{invoice.date}</span>
                      <span className="text-white font-medium">{invoice.amount}</span>
                      <span className="text-green-400 text-sm">{invoice.status}</span>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMSettings;
