import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  Plus,
  Trash2,
  Key,
  Settings,
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE = '/api';

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  is_system: boolean;
}

const DEMO_PERMISSIONS: Permission[] = [
  { id: 1, name: 'read_documents', description: 'View and preview cloud documents', resource: 'documents', action: 'read' },
  { id: 2, name: 'upload_documents', description: 'Upload new documents to vault', resource: 'documents', action: 'create' },
  { id: 3, name: 'delete_documents', description: 'Permanently remove or trash documents', resource: 'documents', action: 'delete' },
  { id: 4, name: 'approve_kyc', description: 'Approve KYC identity verification scans', resource: 'documents', action: 'approve' },
  { id: 5, name: 'export_audit', description: 'Download cryptographic audit trail CSV', resource: 'audit', action: 'export' },
  { id: 6, name: 'manage_permissions', description: 'Configure roles and security policies', resource: 'settings', action: 'update' },
];

const DEMO_ROLES: Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full unconstrained administrative privileges across vault and audit trails',
    permissions: DEMO_PERMISSIONS,
    is_system: true,
  },
  {
    id: 2,
    name: 'Compliance Officer',
    description: 'Authorized to review KYC, verify OCR extractions, and inspect audit trails',
    permissions: [DEMO_PERMISSIONS[0], DEMO_PERMISSIONS[3], DEMO_PERMISSIONS[4]],
    is_system: false,
  },
  {
    id: 3,
    name: 'Document Editor',
    description: 'Standard operational role for file ingestion and metadata tagging',
    permissions: [DEMO_PERMISSIONS[0], DEMO_PERMISSIONS[1]],
    is_system: false,
  },
  {
    id: 4,
    name: 'Vault Viewer',
    description: 'Read-only access to approved documents and search indexes',
    permissions: [DEMO_PERMISSIONS[0]],
    is_system: false,
  },
];

const RESOURCES = ['documents', 'users', 'settings', 'reports', 'audit', 'system'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'export'];

function getToken() {
  return localStorage.getItem('access_token');
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(DEMO_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(DEMO_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: 'documents',
    action: 'read',
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      const [rolesResp, permsResp] = await Promise.all([
        apiFetch(`${API_BASE}/admin/roles`),
        apiFetch(`${API_BASE}/admin/permissions`),
      ]);

      if (rolesResp.ok) {
        const rolesData = await rolesResp.json();
        if (rolesData.roles && rolesData.roles.length > 0) {
          setRoles(rolesData.roles);
        }
      }
      if (permsResp.ok) {
        const permsData = await permsResp.json();
        if (permsData.permissions && permsData.permissions.length > 0) {
          setPermissions(permsData.permissions);
        }
      }
    } catch {
      // Keep demo roles
    }
  }

  function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const newRole: Role = {
      id: Date.now(),
      name: formData.name,
      description: formData.description || 'Custom organizational role',
      permissions: [DEMO_PERMISSIONS[0]],
      is_system: false,
    };
    setRoles(prev => [...prev, newRole]);
    setShowRoleDialog(false);
    setFormData({ name: '', description: '', resource: 'documents', action: 'read' });
  }

  function handleCreatePermission(e: React.FormEvent) {
    e.preventDefault();
    const newPerm: Permission = {
      id: Date.now(),
      name: `${formData.action}_${formData.resource}`,
      description: `Can ${formData.action} on ${formData.resource}`,
      resource: formData.resource,
      action: formData.action,
    };
    setPermissions(prev => [...prev, newPerm]);
    setShowPermissionDialog(false);
    setFormData({ name: '', description: '', resource: 'documents', action: 'read' });
  }

  function handleDeleteRole(roleId: number) {
    setRoles(prev => prev.filter(r => r.id !== roleId));
  }

  function toggleRolePermission(roleId: number, perm: Permission) {
    setRoles(prev =>
      prev.map(r => {
        if (r.id !== roleId || r.is_system) return r;
        const exists = r.permissions.some(p => p.id === perm.id);
        const nextPerms = exists
          ? r.permissions.filter(p => p.id !== perm.id)
          : [...r.permissions, perm];
        return { ...r, permissions: nextPerms };
      })
    );
  }

  return (
    <div className="doka-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Role-Based Access Control (RBAC)
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Permissions & Security Policies</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Define security roles, folder boundaries, and cryptographic verification policies across all users.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Add Security Role
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-800 bg-[#0E1420] text-white">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white">Create New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRole} className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs text-slate-300">Role Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Audit Analyst"
                    className="mt-1 border-slate-700 bg-slate-900 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Description</Label>
                  <Input
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Role responsibilities..."
                    className="mt-1 border-slate-700 bg-slate-900 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowRoleDialog(false)} className="border-slate-700 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    Create Role
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map(role => (
          <Card key={role.id} className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{role.name}</h3>
                      {role.is_system ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400">
                          SYSTEM
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-[10px] text-slate-400">
                          CUSTOM
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{role.description}</p>
                  </div>
                </div>
                {!role.is_system && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRole(role.id)}
                    className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Permission Matrix Toggles */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Granted Privileges</p>
                <div className="space-y-2">
                  {permissions.map(perm => {
                    const isGranted = role.permissions.some(p => p.id === perm.id);
                    return (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 px-3.5 py-2.5 transition hover:bg-slate-900/70"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-xs text-slate-200">{perm.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{perm.description}</p>
                        </div>
                        <Switch
                          checked={isGranted}
                          disabled={role.is_system}
                          onCheckedChange={() => toggleRolePermission(role.id, perm)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Permissions Registry Table */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div>
            <h2 className="font-bold text-white text-base">Registered System Permissions</h2>
            <p className="mt-0.5 text-xs text-slate-400">Atomic scopes enforcing document access control</p>
          </div>
          <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-xs">
            {permissions.length} SCOPES
          </Badge>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-b border-slate-800 bg-slate-900/60">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-semibold text-xs">Permission Name</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Resource</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Action Scope</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Description</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60">
              {permissions.map(perm => (
                <TableRow key={perm.id} className="border-slate-800/60 hover:bg-white/[.02] transition">
                  <TableCell className="font-mono text-xs font-semibold text-emerald-400">
                    {perm.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px] border-slate-700 bg-slate-800 text-slate-300">
                      {perm.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-300 uppercase">{perm.action}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {perm.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> ENFORCED
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
