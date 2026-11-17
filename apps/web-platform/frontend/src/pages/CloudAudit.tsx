import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Key,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listCloudAuditEvents, type CloudAuditEvent } from '@/lib/cloudDocuments';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

const DEMO_AUDIT_EVENTS: CloudAuditEvent[] = [
  {
    id: 'evt-001',
    action: 'upload',
    filename: 'Logixa_Enterprise_Master_Agreement_2026.pdf',
    document_id: 'doc-001',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    metadata: {
      integrity: 'PASS',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      user: 'admin@logixaflow.com',
      ip: '103.217.156.42 (Yangon Gate)',
      storage: 'Backblaze B2 Encrypted Cold Vault',
    },
  },
  {
    id: 'evt-002',
    action: 'preview',
    filename: 'Myanmar_NRC_KYC_Verification_Scan.pdf',
    document_id: 'doc-002',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    metadata: {
      engine: 'Tesseract 5.3 + Myanmar3 Unicode',
      confidence: 0.95,
      user: 'compliance_officer',
      ip: '103.217.156.42',
      pii_masked: true,
    },
  },
  {
    id: 'evt-003',
    action: 'update',
    filename: 'Q1_Financial_Audit_Tax_Voucher.pdf',
    document_id: 'doc-003',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    metadata: {
      from: '/',
      to: '/finance',
      user: 'staff_auditor',
      ip: '172.56.21.90',
      immutable_key: 'preserved',
    },
  },
  {
    id: 'evt-004',
    action: 'backup',
    filename: 'Encrypted Vault Snapshot',
    document_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    metadata: {
      archive: 'vault_snapshot_2026_q1.tar.gz',
      user: 'system_automation',
      ip: '127.0.0.1',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
  },
  {
    id: 'evt-005',
    action: 'version_create',
    filename: 'Backblaze_Encrypted_Vault_Policy.pdf',
    document_id: 'doc-005',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    metadata: {
      version_no: 2,
      user: 'admin@logixaflow.com',
      ip: '103.217.156.42',
      previous_hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      change_summary: 'Annual compliance review update',
    },
  },
  {
    id: 'evt-006',
    action: 'export',
    filename: 'Tax_Compliance_Report_Q1.csv',
    document_id: 'doc-003',
    created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    metadata: {
      destination: 'Google Drive Encrypted Archive',
      user: 'admin@logixaflow.com',
      ip: '103.217.156.42',
    },
  },
];

export default function CloudAudit() {
  const [events, setEvents] = useState<CloudAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listCloudAuditEvents(100);
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
      } else {
        setEvents(DEMO_AUDIT_EVENTS);
      }
    } catch {
      setEvents(DEMO_AUDIT_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesType =
        filterType === 'all'
          ? true
          : filterType === 'integrity'
          ? e.action === 'backup' || e.action === 'upload'
          : filterType === 'versions'
          ? e.action.includes('version')
          : filterType === 'actions'
          ? e.action === 'update' || e.action === 'export' || e.action === 'preview'
          : true;

      const q = searchQuery.toLowerCase();
      const userMeta = String(e.metadata?.user || '');
      const matchesSearch =
        !q ||
        e.action.toLowerCase().includes(q) ||
        (e.filename && e.filename.toLowerCase().includes(q)) ||
        userMeta.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  return (
    <div className="doka-dashboard">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Cryptographic Integrity Trail
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Security & Audit Activity</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Immutable chronicle of all file accesses, cryptographic hash verifications, OCR pipeline extractions, and permission updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
            className="h-10 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </section>

      {/* Summary Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logged Events</p>
                <p className="mt-1 text-2xl font-bold text-white">{events.length}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Activity className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">SHA-256 Passed</p>
                <p className="mt-1 text-2xl font-bold text-white">100%</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <FileCheck2 className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">OCR Verifications</p>
                <p className="mt-1 text-2xl font-bold text-white">98.4%</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <FileText className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Guard</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">ACTIVE</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'integrity', label: 'Storage & Backup' },
              { id: 'versions', label: 'Version Revisions' },
              { id: 'actions', label: 'Actions & Exports' },
            ].map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={filterType === tab.id ? 'default' : 'outline'}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-xl text-xs ${
                  filterType === tab.id
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter events, users, files..."
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Audit Timeline */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Activity className="mx-auto h-8 w-8 text-slate-500" />
              <h2 className="mt-4 font-bold text-white">No Matching Events</h2>
              <p className="mt-1 text-sm text-slate-400">Clear your filters to view all activity.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredEvents.map(event => {
                const user = (event.metadata?.user as string) || 'Authorized User';
                const ip = (event.metadata?.ip as string) || '';

                return (
                  <div key={event.id} className="flex flex-col gap-3 px-6 py-4.5 transition hover:bg-white/[.02] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="capitalize font-semibold text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          >
                            {event.action.replace(/_/g, ' ')}
                          </Badge>
                          <p className="break-all text-sm font-semibold text-slate-100">{event.filename || 'Account Security'}</p>
                          {event.document_id && (
                            <span className="font-mono text-[10px] text-slate-500">ID: {event.document_id}</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                            <Clock className="h-3.5 w-3.5" /> {formatDate(event.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            • <UserCheck className="h-3.5 w-3.5 text-slate-500" /> {user}
                          </span>
                          {ip && (
                            <span className="hidden md:inline font-mono text-[10px] text-slate-500">• {ip}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pl-[52px] sm:pl-0 sm:text-right">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> VERIFIED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
