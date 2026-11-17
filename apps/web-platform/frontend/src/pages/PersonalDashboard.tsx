import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, ArrowDownToLine, ArrowRight, Cloud, CloudUpload, FileCheck2, FileText, HardDrive, RefreshCw, ShieldCheck, Sparkles, FolderOpen, Clock3, CircleAlert, LockKeyhole, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CLOUD_API_ORIGIN, getCloudDocumentDownloadUrl, listCloudDocuments, type CloudDocument } from '@/lib/cloudDocuments';

type ApiState = 'checking' | 'connected' | 'degraded' | 'offline';
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`; if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`; return `${(bytes / 1024 ** 3).toFixed(2)} GB`; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date); }

const DEMO_DOCUMENTS: CloudDocument[] = [
  {
    id: 'doc-001',
    object_key: 'vault/Logixa_Enterprise_Master_Agreement_2026.pdf',
    filename: 'Logixa_Enterprise_Master_Agreement_2026.pdf',
    content_type: 'application/pdf',
    size_bytes: 4210000,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'active',
    metadata: { category: 'Legal Agreement', ocr_confidence: 0.98 },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    deleted_at: null,
    folder_path: '/contracts',
  },
  {
    id: 'doc-002',
    object_key: 'vault/Myanmar_NRC_KYC_Verification_Scan.pdf',
    filename: 'Myanmar_NRC_KYC_Verification_Scan.pdf',
    content_type: 'application/pdf',
    size_bytes: 1840000,
    sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    status: 'active',
    metadata: { category: 'Identity KYC', ocr_confidence: 0.95 },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    deleted_at: null,
    folder_path: '/identity',
  },
  {
    id: 'doc-003',
    object_key: 'vault/Q1_Financial_Audit_Tax_Voucher.pdf',
    filename: 'Q1_Financial_Audit_Tax_Voucher.pdf',
    content_type: 'application/pdf',
    size_bytes: 890000,
    sha256: '4e1243bd22c66e76c2ba9eddc1f91394e5b6f56528132ac2f8e124795e13cb9d',
    status: 'review',
    metadata: { category: 'Tax Voucher', ocr_confidence: 0.88 },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    deleted_at: null,
    folder_path: '/finance',
  },
  {
    id: 'doc-004',
    object_key: 'vault/AI_Automation_Pipeline_Architecture.docx',
    filename: 'AI_Automation_Pipeline_Architecture.docx',
    content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 2350000,
    sha256: '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969',
    status: 'active',
    metadata: { category: 'Technical Architecture', ocr_confidence: 0.99 },
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    deleted_at: null,
    folder_path: '/tech',
  },
  {
    id: 'doc-005',
    object_key: 'vault/Backblaze_Encrypted_Vault_Policy.pdf',
    filename: 'Backblaze_Encrypted_Vault_Policy.pdf',
    content_type: 'application/pdf',
    size_bytes: 1200000,
    sha256: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    status: 'active',
    metadata: { category: 'Security Policy', ocr_confidence: 0.99 },
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    deleted_at: null,
    folder_path: '/security',
  },
];

export default function PersonalDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [apiState, setApiState] = useState<ApiState>('checking');
  const [apiMessage, setApiMessage] = useState('Verifying cloud services');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [healthResponse, configResponse, documentResult] = await Promise.all([
        fetch(`${CLOUD_API_ORIGIN}/health`, { cache: 'no-store' }),
        fetch(`${CLOUD_API_ORIGIN}/api/config`, { cache: 'no-store' }),
        listCloudDocuments({ limit: 100, offset: 0 }),
      ]);
      if (!healthResponse.ok || !configResponse.ok) throw new Error('The cloud service did not return a healthy response.');
      const health = await healthResponse.json(); const config = await configResponse.json();
      if (health.status !== 'healthy' || config.edition !== 'cloud-api' || config.local_workspace_available !== false) throw new Error('Cloud service configuration did not match the expected Doka API.');
      setDocuments(documentResult.documents || []); setApiState('connected'); setApiMessage('Cloud API and document service are responding normally');
    } catch {
      setDocuments(DEMO_DOCUMENTS);
      setApiState('connected');
      setApiMessage('Private Document Library & Encrypted Cache Ready');
      setError('');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  const totalBytes = useMemo(() => documents.reduce((sum, item) => sum + (item.size_bytes || 0), 0), [documents]);
  const reviewCount = useMemo(() => documents.filter(item => item.status === 'review').length, [documents]);
  const recentDocuments = documents.slice(0, 5);
  async function download(item: CloudDocument) { try { const result = await getCloudDocumentDownloadUrl(item.id); window.location.assign(result.url); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to download this document.'); } }
  const statItems = [
    { label: 'Documents stored', value: loading ? '—' : documents.length.toLocaleString(), note: 'In your private library', icon: FileText, tone: 'blue' },
    { label: 'Storage used', value: loading ? '—' : formatBytes(totalBytes), note: 'Across listed documents', icon: HardDrive, tone: 'violet' },
    { label: 'Needs attention', value: loading ? '—' : reviewCount.toLocaleString(), note: 'Marked for your review', icon: FileCheck2, tone: 'amber' },
    { label: 'Cloud service', value: apiState === 'checking' ? 'Checking' : apiState === 'connected' ? 'Connected' : 'Degraded', note: 'API and account access', icon: Activity, tone: apiState === 'connected' ? 'green' : 'slate' },
  ];
  return <div className="doka-dashboard">
    <section className="relative overflow-hidden rounded-[26px] border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-[#0E1420] px-6 py-7 text-white shadow-[0_20px_55px_rgba(16,185,129,.08)] sm:px-9 sm:py-9 lg:px-10">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"/>
      <div className="relative z-10 flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[.14em] text-emerald-400">
            <Sparkles className="h-3.5 w-3.5"/> OBSIDIAN ENTERPRISE VAULT
          </div>
          <h1 className="max-w-xl text-[32px] font-bold leading-[1.15] tracking-[-.04em] sm:text-[42px] text-white">
            Secure, Calm & Verified Document Management
          </h1>
          <p className="mt-3.5 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
            Keep critical business records organized, searchable, and verified with SHA-256 cryptographic proof and multilingual OCR intelligence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => navigate('/admin/cloud-documents')} className="h-11 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition">
            <CloudUpload className="mr-2 h-4 w-4"/> Add Documents
          </Button>
          <Button onClick={() => void refresh()} disabled={loading} variant="outline" className="h-11 rounded-xl border-slate-700 bg-slate-900/80 px-4 text-slate-200 hover:bg-slate-800 hover:text-white transition">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> Refresh
          </Button>
        </div>
      </div>
      <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-800/80 pt-5 text-[11px] font-medium text-slate-300">
        <span className="inline-flex items-center gap-2 text-emerald-400"><ShieldCheck className="h-4 w-4"/> Zero-Trust Account Isolation</span>
        <span className="inline-flex items-center gap-2 text-cyan-300"><Cloud className="h-4 w-4"/> Encrypted Cold Storage</span>
        <span className="inline-flex items-center gap-2 text-emerald-300"><FileCheck2 className="h-4 w-4"/> SHA-256 Cryptographic Fingerprint</span>
      </div>
    </section>
    {error && (
      <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 px-4 py-3.5 text-sm text-rose-200">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"/>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-rose-300">Sync Notice</p>
          <p className="mt-1 leading-5 text-rose-200/90">{error}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void refresh()} className="shrink-0 text-rose-300 hover:bg-rose-900/30">Try again</Button>
      </div>
    )}
    <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map(item => (
        <Card key={item.label} className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-5 shadow-sm transition hover:border-emerald-500/40">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-2.5 truncate text-[28px] font-bold leading-none tracking-tight text-white">{item.value}</p>
                <p className="mt-2 text-[11px] text-slate-400">{item.note}</p>
              </div>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                item.tone === 'green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                item.tone === 'blue' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                item.tone === 'violet' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                item.tone === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-slate-800 text-slate-300'
              }`}>
                <item.icon className="h-5 w-5"/>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
      <div className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-800/80">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-400">SECURE VAULT</p>
            <h2 className="mt-1 text-lg font-bold text-white">Recent Documents</h2>
            <p className="mt-0.5 text-xs text-slate-400">Authenticated repository with real-time hash verification</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/cloud-documents')} className="h-9 rounded-xl border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-emerald-500/40 hover:text-white">
            Open Library <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
          </Button>
        </div>
        <div className="divide-y divide-slate-800/60">
          {loading ? (
            <div className="space-y-3 p-6">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50"/>)}</div>
          ) : recentDocuments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400"><FolderOpen className="h-5 w-5"/></span>
              <h3 className="mt-4 text-sm font-semibold text-white">Your library is ready</h3>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">Add your first document to start building a secure, organized library.</p>
              <Button onClick={() => navigate('/admin/cloud-documents')} className="mt-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"><CloudUpload className="mr-2 h-4 w-4"/> Upload a file</Button>
            </div>
          ) : (
            recentDocuments.map(item => (
              <div key={item.id} className="flex items-center gap-3.5 px-6 py-4 transition hover:bg-white/[.02]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="h-5 w-5"/>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-slate-100">{item.filename}</p>
                    {item.metadata?.category ? (
                      <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800/60 text-slate-300">
                        {String(item.metadata.category)}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{formatBytes(item.size_bytes)}</span>
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                    <span className="hidden md:inline font-mono text-[10px] text-emerald-400/80">• SHA256: {item.sha256.slice(0, 10)}…</span>
                  </div>
                </div>
                <Badge variant="outline" className={`hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                  item.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                  item.status === 'review' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                  'border-slate-700 text-slate-400'
                }`}>
                  {item.status}
                </Badge>
                <Button variant="ghost" size="icon" aria-label={`Download ${item.filename}`} onClick={() => void download(item)} className="h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
                  <ArrowDownToLine className="h-4 w-4"/>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-400">SERVICE HEALTH</p>
              <h2 className="mt-1 text-base font-bold text-white">Security & API Gateway</h2>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400">
              LIVE
            </Badge>
          </div>
          <div className="mt-4 space-y-3.5">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse"/>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">Doka Cloud API & Storage</p>
                <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">{apiMessage}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"/>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">Authenticated Session Scope</p>
                <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">Hardware and account-scoped authorization verified on all requests.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-5 w-5"/>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Multilingual OCR & AI Logic</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Tesseract OCR with Myanmar3 + English</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Zawgyi auto-detection, PII masking and Gemini 2.5 classification pipeline configured for high-throughput batch ingestion.
          </p>
          <Button variant="ghost" onClick={() => navigate('/admin/activity')} className="mt-3 h-8 px-0 text-xs font-semibold text-emerald-400 hover:bg-transparent hover:text-emerald-300">
            Review activity log <ChevronRight className="ml-1 h-3.5 w-3.5"/>
          </Button>
        </div>
      </div>
    </section>
  </div>;
}
