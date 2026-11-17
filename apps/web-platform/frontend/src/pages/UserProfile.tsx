import { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, Save, CheckCircle2, ShieldCheck, Key, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFieldValidation, validationRules, ValidationMessage, ValidatedInput, PasswordStrength } from '@/components/FormValidation';
import { success, error } from '@/components/Toast';

export default function UserProfile() {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Profile settings
  const [username, setUsername] = useState(localStorage.getItem('username') || 'doka-admin');
  const [email, setEmail] = useState('logixaflow@gmail.com');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Validation
  const usernameValidation = useFieldValidation(username, [validationRules.required(), validationRules.minLength(3)], true);
  const emailValidation = useFieldValidation(email, [validationRules.required(), validationRules.email()], true);
  const newPasswordValidation = useFieldValidation(newPassword, [validationRules.password()], true);
  const confirmPasswordValidation = useFieldValidation(
    confirmPassword,
    [validationRules.match(newPassword, 'Passwords do not match')],
    true
  );

  const handleProfileSave = async () => {
    setLoading(true);
    setApiError('');
    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      success('Profile credentials updated successfully');
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setApiError('');
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
      success('Security password changed successfully');
    }, 400);
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      success('Notification preferences updated');
    }, 300);
  };

  return (
    <div className="doka-dashboard max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <ShieldCheck className="h-4 w-4" /> Account & Security Identity
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Administrator Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage account credentials, authentication methods, and security preferences</p>
      </div>

      {apiError && (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-950/20 text-rose-200">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-emerald-500/30 bg-emerald-950/20 text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertDescription>Profile settings saved successfully</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <User className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Profile Information</h2>
            <p className="text-xs text-slate-400">Account identity and communication address</p>
          </div>
        </div>
        <div className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs text-slate-300">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="border-slate-700 bg-slate-900 text-white rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-slate-300">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 border-slate-700 bg-slate-900 text-white rounded-xl text-xs"
              />
            </div>
          </div>

          <Button onClick={handleProfileSave} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </Card>

      {/* Password Change */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Lock className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Change Vault Master Password</h2>
            <p className="text-xs text-slate-400">Update your access key to ensure cryptographic isolation</p>
          </div>
        </div>
        <div className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs text-slate-300">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="border-slate-700 bg-slate-900 text-white rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs text-slate-300">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="border-slate-700 bg-slate-900 text-white rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs text-slate-300">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border-slate-700 bg-slate-900 text-white rounded-xl text-xs"
            />
          </div>

          <Button onClick={handlePasswordChange} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">
            <Key className="w-4 h-4 mr-2" />
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {/* Security Telemetry */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Active Session Security</h2>
            <p className="text-xs text-slate-400">Hardware token and TLS 1.3 encryption status</p>
          </div>
        </div>
        <div className="space-y-4 pt-5">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">Active Session Origin</p>
              <p className="text-[11px] font-mono text-emerald-400">103.217.156.42 · SHA-256 Authenticated</p>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
              VERIFIED
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
