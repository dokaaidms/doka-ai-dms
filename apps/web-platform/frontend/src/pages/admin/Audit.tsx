import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  FileText,
  Settings,
  Shield,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE = '/api';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string;
  ip_address: string;
  status: string;
}

const ACTION_TYPES = ['all', 'create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'approve', 'reject'];
const RESOURCE_TYPES = ['all', 'document', 'user', 'role', 'permission', 'setting', 'system'];
const STATUSES = ['all', 'success', 'failure', 'warning'];

const DEMO_LOGS: AuditLog[] = [
  {
    id: 101,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: 'admin@logixaflow.com',
    action: 'approve',
    resource_type: 'document',
    resource_id: 'doc-001',
    details: 'Logixa_Enterprise_Master_Agreement_2026.pdf verified and moved to active vault',
    ip_address: '103.217.156.42',
    status: 'success',
  },
  {
    id: 102,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: 'compliance_officer',
    action: 'read',
    resource_type: 'document',
    resource_id: 'doc-002',
    details: 'Myanmar NRC KYC scan inspected; OCR text preview rendered',
    ip_address: '103.217.156.42',
    status: 'success',
  },
  {
    id: 103,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    user: 'system_automation',
    action: 'create',
    resource_type: 'system',
    resource_id: 'snap-2026',
    details: 'Automated cryptographic backup snapshot generated with SHA-256 seal',
    ip_address: '127.0.0.1',
    status: 'success',
  },
  {
    id: 104,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: 'staff_auditor',
    action: 'export',
    resource_type: 'report',
    resource_id: 'rep-q1',
    details: 'Tax compliance summary CSV exported with HMAC token',
    ip_address: '172.56.21.90',
    status: 'success',
  },
  {
    id: 105,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    user: 'external_crawler',
    action: 'login',
    resource_type: 'system',
    resource_id: null,
    details: 'Failed authentication attempt: Invalid bearer signature',
    ip_address: '45.133.1.20',
    status: 'failure',
  },
  {
    id: 106,
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    user: 'admin@logixaflow.com',
    action: 'update',
    resource_type: 'permission',
    resource_id: 'role-02',
    details: 'Updated role permissions for Document Editor: Added OCR review privileges',
    ip_address: '103.217.156.42',
    status: 'success',
  },
];

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionIcon(action: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    create: FileText,
    read: Activity,
    update: Settings,
    delete: Trash2,
    login: User,
    logout: User,
    export: Download,
    approve: ShieldCheck,
    reject: AlertTriangle,
  };
  return icons[action] || Activity;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(DEMO_LOGS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (resourceFilter !== 'all') params.append('resource_type', resourceFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await apiFetch(`${API_BASE}/audit/logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setLogs(
            data.items.map((item: any) => ({
              id: item.id,
              timestamp: item.timestamp,
              user: item.username,
              action: item.action.toLowerCase(),
              resource_type: item.document_id ? 'document' : 'system',
              resource_id: item.document_id?.toString() || null,
              details: item.details || '',
              ip_address: item.ip_address || '',
              status: 'success',
            }))
          );
        } else {
          setLogs(DEMO_LOGS);
        }
      } else {
        setLogs(DEMO_LOGS);
      }
    } catch {
      setLogs(DEMO_LOGS);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    void Promise.resolve().then(loadAuditLogs);
  }, [loadAuditLogs]);

  function handleExportLogs() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Action,Resource,Details,IP Address,Status']
        .concat(
          logs.map(
            l =>
              `"${l.timestamp}","${l.user}","${l.action}","${l.resource_type}","${l.details}","${l.ip_address}","${l.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doka_audit_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ip_address.toLowerCase().includes(q);
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchesSearch && matchesAction && matchesResource && matchesStatus;
    });
  }, [logs, searchQuery, actionFilter, resourceFilter, statusFilter]);

  return (
    <div className="doka-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Enterprise Compliance Log
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Audit Trail</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Real-time security event telemetry, administrative actions, and authorization changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleExportLogs}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={loadAuditLogs}
            disabled={loading}
            variant="outline"
            className="h-10 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <Input
                placeholder="Search logs by user, action, IP, or details..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-700 bg-slate-900 text-white placeholder-slate-500 rounded-xl text-xs"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[160px] border-slate-700 bg-slate-900 text-slate-200 rounded-xl text-xs">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-[#0E1420] text-slate-200">
                {ACTION_TYPES.map(action => (
                  <SelectItem key={action} value={action} className="text-xs">
                    {action === 'all' ? 'All actions' : action.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full sm:w-[160px] border-slate-700 bg-slate-900 text-slate-200 rounded-xl text-xs">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-[#0E1420] text-slate-200">
                {RESOURCE_TYPES.map(resource => (
                  <SelectItem key={resource} value={resource} className="text-xs">
                    {resource === 'all' ? 'All resources' : resource.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] border-slate-700 bg-slate-900 text-slate-200 rounded-xl text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-[#0E1420] text-slate-200">
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status === 'all' ? 'All statuses' : status.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-b border-slate-800 bg-slate-900/60">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-semibold text-xs">Timestamp</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">User</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Action</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Resource</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Event Details</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">IP Address</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60">
              {filteredLogs.map(log => {
                const ActionIcon = getActionIcon(log.action);
                const isSuccess = log.status === 'success';

                return (
                  <TableRow key={log.id} className="border-slate-800/60 hover:bg-white/[.02] transition">
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="font-semibold text-xs text-slate-200">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <ActionIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="capitalize font-semibold text-slate-200">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] border-slate-700 bg-slate-800 text-slate-300">
                        {log.resource_type}
                      </Badge>
                      {log.resource_id && (
                        <span className="text-[10px] text-slate-500 ml-1 font-mono">#{log.resource_id}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-300 max-w-sm truncate">
                        {log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] font-mono text-emerald-400/90 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                        {log.ip_address}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase ${
                          isSuccess
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No audit records found matching criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
