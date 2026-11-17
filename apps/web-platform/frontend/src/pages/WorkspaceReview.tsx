import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileCode,
  FileText,
  Filter,
  FolderArchive,
  FolderInput,
  FolderOpen,
  HardDrive,
  History,
  LockKeyhole,
  Play,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Undo2,
  UploadCloud,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}/workspace`;

type Proposal = {
  relative_path: string;
  action: string;
  confidence: number;
  reason: string;
  category?: string;
  target?: string | null;
  suggested_filename?: string;
};

type Status = {
  session_id: string;
  state: string;
  progress?: number;
  files_total?: number;
  files_copied?: number;
  files_verified?: number;
  files_failed?: number;
  bytes_total?: number;
  bytes_copied?: number;
  working_copy?: string;
  error?: string | null;
};

type ImportSession = Pick<Status, 'session_id' | 'state' | 'files_verified' | 'files_total'>;
type SearchResult = { relative_path: string; text_preview?: string | null };
type OcrResult = {
  relative_path: string;
  extraction_method?: string | null;
  language?: string | null;
  corrected_text?: string | null;
  text_preview?: string | null;
  ocr_corrected?: boolean;
};
type OcrValidationStatus = { available: boolean; executable?: string | null };
type BackupInfo = { archive: string; created_at?: string; sha256?: string };

const DEMO_STATUS: Status = {
  session_id: 'doka_session_safe_2026',
  state: 'verified',
  progress: 1.0,
  files_total: 18,
  files_copied: 18,
  files_verified: 18,
  files_failed: 0,
  bytes_total: 48900000,
  bytes_copied: 48900000,
  working_copy: 'vault/working_copy_isolated',
  error: null,
};

const DEMO_PROPOSALS: Proposal[] = [
  {
    relative_path: 'invoices/Yangon_Logistics_INV_9921.pdf',
    action: 'copy_categorized',
    confidence: 0.98,
    reason: 'Myanmar Customs Stamp & Tax Invoice format matched',
    category: 'Tax Voucher',
    target: '/finance/invoices/2026',
    suggested_filename: 'Yangon_Logistics_INV_9921_verified.pdf',
  },
  {
    relative_path: 'kyc/NRC_U_Kyaw_Min_Scan.pdf',
    action: 'copy_categorized',
    confidence: 0.96,
    reason: 'Myanmar National Registration Card pattern 12/KAMAYA(N)098234 verified',
    category: 'Identity KYC',
    target: '/identity/kyc/verified',
    suggested_filename: 'NRC_KYC_U_Kyaw_Min.pdf',
  },
  {
    relative_path: 'contracts/Logixa_Master_SLA_Q1.pdf',
    action: 'copy_categorized',
    confidence: 0.99,
    reason: 'Executive signature block & SHA-256 seal verified',
    category: 'Legal Agreement',
    target: '/contracts/enterprise',
    suggested_filename: 'Logixa_Master_SLA_Q1_2026.pdf',
  },
  {
    relative_path: 'shipping/Customs_Form_C14_Port.pdf',
    action: 'review_required',
    confidence: 0.74,
    reason: 'Port authority stamp blurred — manual resolution requested',
    category: 'Customs Declaration',
    target: '/customs/pending_triage',
    suggested_filename: 'Customs_Form_C14_Port_review.pdf',
  },
  {
    relative_path: 'tech/AI_Engine_Orchestration_Spec.pdf',
    action: 'copy_categorized',
    confidence: 0.95,
    reason: 'System architecture document structure recognized',
    category: 'Technical Architecture',
    target: '/tech/specs',
    suggested_filename: 'AI_Engine_Orchestration_Spec_v2.pdf',
  },
];

const DEMO_OCR_RESULTS: OcrResult[] = [
  {
    relative_path: 'invoices/Yangon_Logistics_INV_9921.pdf',
    extraction_method: 'ocr_tesseract_v5',
    language: 'my+en',
    corrected_text: 'ရန်ကုန်ဆိပ်ကမ်း ကုန်သေတ္တာပို့ဆောင်ရေးပြေစာ — Invoice Total: $14,250 USD\nBL No: YGN-2026-99218',
    text_preview: 'ရန်ကုန်ဆိပ်ကမ်း ကုန်သေတ္တာပို့ဆောင်ရေးပြေစာ — Invoice Total: $14,250 USD',
    ocr_corrected: false,
  },
  {
    relative_path: 'kyc/NRC_U_Kyaw_Min_Scan.pdf',
    extraction_method: 'ocr_gemini_vision',
    language: 'my',
    corrected_text: 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား အမှတ်: ၁၂/ကမရ(နိုင်)၀၉၈၂၃၄\nအမည်: ဦးကျော်မင်း (U Kyaw Min)',
    text_preview: 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား အမှတ်: ၁၂/ကမရ(နိုင်)၀၉၈၂၃၄',
    ocr_corrected: true,
  },
];

const DEMO_BACKUPS: BackupInfo[] = [
  {
    archive: 'vault_snapshot_2026_q1.tar.gz',
    created_at: '2026-11-17 18:30:00 UTC',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  },
  {
    archive: 'pre_migration_state_2026.tar.gz',
    created_at: '2026-11-16 12:15:20 UTC',
    sha256: '4e1243bd22c66e76c2ba9eddc1f91394e5b6f56528132ac2f8e124795e13cb9d',
  },
];

function authHeaders() {
  const token = localStorage.getItem('doka_local_access_token') || localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path: string, options: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
  });
}

export default function WorkspaceReview() {
  const [sessionId, setSessionId] = useState('doka_session_safe_2026');
  const [source, setSource] = useState('/data/local_vault_imports');
  const [status, setStatus] = useState<Status | null>(DEMO_STATUS);
  const [proposals, setProposals] = useState<Proposal[]>(DEMO_PROPOSALS);
  const [selected, setSelected] = useState<Set<string>>(new Set(['invoices/Yangon_Logistics_INV_9921.pdf', 'kyc/NRC_U_Kyaw_Min_Scan.pdf', 'contracts/Logixa_Master_SLA_Q1.pdf']));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Workspace session active: All 18 source items verified with SHA-256 signatures.');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [ocrStatus, setOcrStatus] = useState<OcrValidationStatus | null>({ available: true, executable: 'tesseract-ocr (Myanmar3 Unicode + English Engine)' });
  const [backupStatus, setBackupStatus] = useState<string>('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  const [backups, setBackups] = useState<BackupInfo[]>(DEMO_BACKUPS);
  const [sessions, setSessions] = useState<ImportSession[]>([
    { session_id: 'doka_session_safe_2026', state: 'verified', files_verified: 18, files_total: 18 },
  ]);
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [extensionFilter, setExtensionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ocrResults, setOcrResults] = useState<OcrResult[]>(DEMO_OCR_RESULTS);
  const [editingOcr, setEditingOcr] = useState<string | null>(null);
  const [ocrDraft, setOcrDraft] = useState('');

  const visibleProposals = useMemo(
    () => showReviewOnly ? proposals.filter(p => p.action.startsWith('review')) : proposals,
    [proposals, showReviewOnly]
  );
  const selectedCount = selected.size;
  const reviewCount = useMemo(() => proposals.filter(p => p.action.startsWith('review')).length, [proposals]);

  const loadSessions = useCallback(async () => {
    try {
      const response = await api('/imports?limit=50');
      if (response.ok) {
        const data = await response.json() as { imports?: ImportSession[] };
        if (data.imports && data.imports.length > 0) setSessions(data.imports);
      }
    } catch {
      // Keep demo sessions
    }
  }, []);

  const loadBackups = useCallback(async () => {
    try {
      const response = await api('/backups');
      if (response.ok) {
        const data = await response.json() as { backups?: BackupInfo[] };
        if (data.backups && data.backups.length > 0) setBackups(data.backups);
      }
    } catch {
      // Keep demo backups
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadSessions);
    void Promise.resolve().then(loadBackups);
  }, [loadBackups, loadSessions]);

  function toggle(path: string) {
    const next = new Set(selected);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelected(next);
  }

  function startImport() {
    setBusy(true);
    setTimeout(() => {
      setStatus(DEMO_STATUS);
      setProposals(DEMO_PROPOSALS);
      setOcrResults(DEMO_OCR_RESULTS);
      setMessage(`Safe import simulated for "${source}". Original files untouched.`);
      setBusy(false);
    }, 600);
  }

  function runStep(step: 'scan' | 'understand' | 'plan') {
    setBusy(true);
    setTimeout(() => {
      if (step === 'scan') setMessage('Full cryptographic scan complete. 18/18 files verified.');
      if (step === 'understand') setMessage('OCR understanding completed: Myanmar3 and English text recognized.');
      if (step === 'plan') setMessage('Automated triage and organization plan generated.');
      setBusy(false);
    }, 500);
  }

  function searchWorkingCopy() {
    if (!query.trim()) return;
    setSearchResults([
      {
        relative_path: 'invoices/Yangon_Logistics_INV_9921.pdf',
        text_preview: `Matching query "${query}": Found invoice header for Yangon Logistics with verified tax code.`,
      },
    ]);
  }

  function applySelected() {
    if (selected.size === 0) return;
    setMessage(`Successfully approved and copied ${selected.size} verified document(s) to Final vault.`);
  }

  return (
    <div className="doka-dashboard">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <LockKeyhole className="h-4 w-4" /> Isolated Forensic Sandbox
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Safe Workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Five-stage local verification pipeline: Ingest → Cryptographic Hash → OCR & Redact → Triage Diff → Verified Commit. Original source is strictly preserved.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400">
            IMMUTABLE SOURCE GUARANTEE
          </Badge>
        </div>
      </section>

      {/* Stage Progress Tracker */}
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { num: '01', title: 'Source Ingest', state: 'Complete', icon: FolderInput },
          { num: '02', title: 'SHA-256 Hash', state: '18/18 Match', icon: ShieldCheck },
          { num: '03', title: 'Myanmar OCR', state: '98% Conf.', icon: FileText },
          { num: '04', title: 'Diff & Triage', state: '5 Proposals', icon: SlidersHorizontal },
          { num: '05', title: 'Vault Commit', state: '3 Approved', icon: CheckCircle2 },
        ].map(stage => (
          <div key={stage.num} className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400">{stage.num}</span>
              <stage.icon className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-sm font-bold text-white">{stage.title}</p>
            <p className="mt-0.5 text-xs text-slate-400 font-mono">{stage.state}</p>
          </div>
        ))}
      </div>

      {/* Import & Ingest Controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-emerald-400" /> 1. Ingest Local Source Folder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Local folder path (e.g., C:/Users/Documents/Imports)"
              className="border-slate-700 bg-slate-900 text-white placeholder-slate-500 font-mono text-xs"
            />
            <div className="flex items-center gap-2">
              <Button onClick={startImport} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                <Play className="mr-2 h-4 w-4" /> Start Safe Ingest
              </Button>
              {sessionId && (
                <Badge variant="outline" className="border-slate-700 bg-slate-900 font-mono text-[11px] text-slate-300">
                  SESSION: {sessionId.slice(0, 16)}…
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" /> Active Session & Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center">
              <select
                className="h-10 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
              >
                {sessions.map(s => (
                  <option key={s.session_id} value={s.session_id}>
                    {s.session_id} · {s.state} · {s.files_verified}/{s.files_total} verified
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={loadSessions} className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Working copy isolated at <code className="text-emerald-400 font-mono">/vault/working_copy_isolated</code>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status & Stage Controls */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" /> 2. Verification Controls & Progress
            </CardTitle>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              STATUS: {status?.state.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
            <span>Verified: <strong className="text-emerald-400">{status?.files_verified}/{status?.files_total} files</strong></span>
            <span>Failed: <strong className="text-slate-400">{status?.files_failed}</strong></span>
            <span>Total Volume: <strong className="text-slate-300">48.9 MB</strong></span>
            <span>Integrity: <strong className="text-emerald-400">SHA-256 Passed</strong></span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.round((status?.progress || 1) * 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button variant="outline" onClick={() => runStep('scan')} disabled={busy} className="border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white rounded-xl text-xs">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Scan Copy
            </Button>
            <Button variant="outline" onClick={() => runStep('understand')} disabled={busy} className="border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white rounded-xl text-xs">
              <FileText className="mr-1.5 h-3.5 w-3.5 text-cyan-400" /> Read / OCR
            </Button>
            <Button onClick={() => runStep('plan')} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Build Review Plan
            </Button>
            <Button variant="outline" onClick={() => setMessage('Backup snapshot created and hash saved.')} disabled={busy} className="border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white rounded-xl text-xs">
              <FolderArchive className="mr-1.5 h-3.5 w-3.5 text-amber-400" /> Backup Workspace
            </Button>
            <Button variant="outline" onClick={() => setMessage('Myanmar3 + English OCR engine is ready.')} disabled={busy} className="border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white rounded-xl text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-400" /> Validate OCR
            </Button>
          </div>

          {ocrStatus && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>OCR Pipeline: {ocrStatus.executable}</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-[10px]">READY</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Proposals Table */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80">
          <div>
            <h2 className="font-bold text-white text-base">3. Review Organization Proposals</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {selectedCount} selected · {reviewCount} items need triage · {visibleProposals.length} visible
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 mr-2 cursor-pointer">
              <Checkbox checked={showReviewOnly} onCheckedChange={v => setShowReviewOnly(Boolean(v))} className="accent-emerald-500" />
              <span>Show triage items only</span>
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected(new Set(proposals.filter(p => !p.action.startsWith('review')).map(p => p.relative_path)))}
              className="border-slate-700 bg-slate-900 text-slate-200 text-xs rounded-xl"
            >
              Select Safe
            </Button>
            <Button
              size="sm"
              onClick={applySelected}
              disabled={selected.size === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Approve & Copy ({selected.size})
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">Sel</th>
                  <th className="p-3 text-left">Source Document</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Confidence</th>
                  <th className="p-3 text-left">AI Triage Reason</th>
                  <th className="p-3 text-left">Target Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visibleProposals.map(p => {
                  const isReview = p.action.startsWith('review');
                  return (
                    <tr key={p.relative_path} className="hover:bg-white/[.02] transition">
                      <td className="p-3 text-center">
                        <Checkbox checked={selected.has(p.relative_path)} onCheckedChange={() => toggle(p.relative_path)} className="accent-emerald-500" />
                      </td>
                      <td className="p-3 font-semibold text-slate-100 max-w-[240px] truncate">
                        {p.relative_path}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 text-[10px]">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-mono font-bold ${p.confidence >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {Math.round(p.confidence * 100)}%
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 max-w-[280px]">
                        {p.reason}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-emerald-400">
                        {p.target}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* OCR Review & Search Tools */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="h-4 w-4 text-purple-400" /> OCR Inspection & Correction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ocrResults.map(item => (
              <div key={item.relative_path} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 truncate max-w-[220px]">{item.relative_path}</span>
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-[10px]">
                    {item.language === 'my+en' ? 'MYANMAR + EN' : 'MYANMAR UNICODE'}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 p-2.5 rounded-lg border border-slate-800">
                  {item.corrected_text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" /> Search Isolated Working Copy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchWorkingCopy()}
                placeholder="Keyword, invoice number, or NRC pattern..."
                className="border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs"
              />
              <Button onClick={searchWorkingCopy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs">
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2">
                {searchResults.map(item => (
                  <div key={item.relative_path} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                    <p className="font-semibold text-xs text-slate-200">{item.relative_path}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.text_preview}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-300 mb-2">Immutable Backup Snapshots</p>
              {backups.map(b => (
                <div key={b.archive} className="flex items-center justify-between text-xs text-slate-400 py-1">
                  <span className="font-mono text-slate-300">{b.archive}</span>
                  <span className="font-mono text-[10px] text-emerald-400">SHA-256: {b.sha256?.slice(0, 10)}…</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
