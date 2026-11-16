import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Key,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  HardDrive,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ApiCredential {
  name: string;
  provider: string;
  maskedKey: string;
  fullKeyPreview: string;
  status: 'Active' | 'Standby' | 'Degraded';
  lastPing: string;
}

const CREDENTIALS: ApiCredential[] = [
  {
    name: 'GEMINI_API_KEY',
    provider: 'Google AI Studio (Gemini 2.5 Flash / Pro)',
    maskedKey: 'AIzaSy••••••••8819',
    fullKeyPreview: 'AIzaSy••••••••8819',
    status: 'Active',
    lastPing: '2 mins ago',
  },
  {
    name: 'VOYAGE_API_KEY',
    provider: 'Voyage AI (1024-dim Vector Embeddings)',
    maskedKey: 'pa-5iv••••••••VQJ',
    fullKeyPreview: 'pa-5iv••••••••VQJ',
    status: 'Active',
    lastPing: '18 mins ago',
  },
  {
    name: 'QDRANT_API_KEY',
    provider: 'Qdrant Cloud (Vector Database Hybrid Search)',
    maskedKey: 'eyJhb••••••••Iss',
    fullKeyPreview: 'eyJhb••••••••Iss',
    status: 'Active',
    lastPing: 'Just now',
  },
  {
    name: 'B2_APPLICATION_KEY',
    provider: 'Backblaze B2 (Encrypted Cold Storage Archive)',
    maskedKey: 'K003L••••••••tzBs',
    fullKeyPreview: 'K003L••••••••tzBs',
    status: 'Active',
    lastPing: '1 min ago',
  },
  {
    name: 'OPENROUTER_API_KEY',
    provider: 'OpenRouter Fallback (Secondary LLM Gateway)',
    maskedKey: 'sk-or-••••••••9b4f',
    fullKeyPreview: 'sk-or-••••••••9b4f',
    status: 'Standby',
    lastPing: '2 days ago',
  },
  {
    name: 'SENTRY_DSN',
    provider: 'Sentry Performance & OCR Error Monitoring',
    maskedKey: 'https://••••@o4512.ingest.sentry.io/4512',
    fullKeyPreview: 'https://••••@o4512.ingest.sentry.io/4512',
    status: 'Active',
    lastPing: '3 mins ago',
  },
];

interface ErrorIncident {
  id: string;
  time: string;
  docId: string;
  service: string;
  event: string;
  severity: 'Warning' | 'Resolved' | 'Info';
}

const INCIDENTS: ErrorIncident[] = [
  {
    id: 'inc-104',
    time: '14:22:10',
    docId: 'DOC-2026-0418',
    service: 'Tesseract OCR',
    event: 'Zawgyi non-unicode font detected — auto-converted to Myanmar3',
    severity: 'Resolved',
  },
  {
    id: 'inc-103',
    time: '12:05:40',
    docId: 'DOC-2026-0392',
    service: 'Gemini 2.5 Flash',
    event: 'Payload rate limit 429 warning — failover to OpenRouter avoided',
    severity: 'Warning',
  },
  {
    id: 'inc-102',
    time: '10:48:15',
    docId: 'DOC-2026-0371',
    service: 'PII Redactor',
    event: 'NRC Number (12/KAMAYA(N)098234) masked with SHA-256 token',
    severity: 'Info',
  },
  {
    id: 'inc-101',
    time: '08:30:02',
    docId: 'DOC-2026-0320',
    service: 'Backblaze B2',
    event: 'Checksum verification matched SHA-256 (38.2 MB upload verified)',
    severity: 'Resolved',
  },
];

export default function AiUsage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0d131f] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Usage, Keys & Error Telemetry
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Live monitoring of Gemini 2.5, Voyage AI, Qdrant Vector DB, and Backblaze B2
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9 self-start rounded-xl border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:bg-slate-700 hover:text-white sm:self-auto"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-slate-800 bg-[#0d131f]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Documents Ingested
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">2,840</span>
              <span className="text-xs font-semibold text-emerald-400">+14.2%</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Across 8 pipeline stages this week</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800 bg-[#0d131f]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI & OCR Token Usage
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">1,425,000</span>
              <span className="text-xs text-slate-400">/ 5M quota</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '28.5%' }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">28.5% consumed · 3,575,000 tokens remaining</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800 bg-[#0d131f]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                System Error Rate
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-400">0.08%</span>
              <span className="text-xs font-medium text-emerald-300">Healthy</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">All 5 cloud services responding within SLA</p>
          </CardContent>
        </Card>
      </div>

      {/* API Credentials & Provider Status */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">API Credentials & Provider Status</h2>
          </div>
          <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
            5 of 6 Active
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Variable Name</th>
                <th className="pb-3">Service & Purpose</th>
                <th className="pb-3">Masked Secret</th>
                <th className="pb-3">Health Status</th>
                <th className="pb-3 pr-2 text-right">Last Invocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {CREDENTIALS.map(cred => (
                <tr key={cred.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-blue-300">{cred.name}</td>
                  <td className="py-3.5 font-sans text-slate-300">{cred.provider}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{cred.maskedKey}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(cred.name, cred.fullKeyPreview)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Copy masked key"
                      >
                        {copiedKey === cred.name ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge
                      className={`text-[10px] font-sans font-semibold ${
                        cred.status === 'Active'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {cred.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 pr-2 text-right font-sans text-slate-400">{cred.lastPing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Custom Visualizations */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Chart 1: 7-Day Ingestion Volume Curve */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                7-Day Document Ingestion & AI Extraction Volume
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Total: 2,840 docs</span>
          </div>

          <div className="mt-5 h-48 w-full">
            <svg viewBox="0 0 600 160" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="dokaCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="4 4" />

              {/* Area fill */}
              <polygon
                points="30,125 110,105 190,115 270,75 350,85 430,45 530,35 530,140 30,140"
                fill="url(#dokaCurveGrad)"
              />

              {/* Smooth curve */}
              <polyline
                points="30,125 110,105 190,115 270,75 350,85 430,45 530,35"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                { x: 30, y: 125, val: '210' },
                { x: 110, y: 105, val: '290' },
                { x: 190, y: 115, val: '265' },
                { x: 270, y: 75, val: '430' },
                { x: 350, y: 85, val: '390' },
                { x: 430, y: 45, val: '580' },
                { x: 530, y: 35, val: '675' },
              ].map(pt => (
                <g key={pt.x}>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#3b82f6" stroke="#0d131f" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {pt.val}
                  </text>
                </g>
              ))}

              {/* X axis labels */}
              {[
                { x: 30, day: 'Mon' },
                { x: 110, day: 'Tue' },
                { x: 190, day: 'Wed' },
                { x: 270, day: 'Thu' },
                { x: 350, day: 'Fri' },
                { x: 430, day: 'Sat' },
                { x: 530, day: 'Sun' },
              ].map(lbl => (
                <text
                  key={lbl.day}
                  x={lbl.x}
                  y="155"
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {lbl.day}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 2: Document Format Share */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Document Format Share
            </h3>
            <span className="text-xs text-blue-400 font-medium">Auto-Categorized</span>
          </div>

          <div className="mt-5 space-y-4">
            {[
              { label: 'PDF Documents & Invoices', count: '1,534 docs', pct: 54, color: 'bg-blue-500' },
              { label: 'Scanned Receipts (TIFF/PNG)', count: '625 docs', pct: 22, color: 'bg-indigo-500' },
              { label: 'DOCX Legal Agreements', count: '454 docs', pct: 16, color: 'bg-cyan-500' },
              { label: 'National ID & Identity (NRC)', count: '227 docs', pct: 8, color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="font-mono text-slate-400">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentry-Style OCR & System Error Telemetry */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">System Error & OCR Exception Tracker</h2>
          </div>
          <span className="text-xs text-slate-400">Realtime Sentry Feed</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">Incident / Resolution</th>
                <th className="pb-3">Document ID</th>
                <th className="pb-3">Service</th>
                <th className="pb-3 pr-2 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {INCIDENTS.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 text-slate-500">{inc.time}</td>
                  <td className="py-3 font-sans text-slate-200 font-medium">{inc.event}</td>
                  <td className="py-3 text-blue-300">{inc.docId}</td>
                  <td className="py-3 font-sans text-slate-400">{inc.service}</td>
                  <td className="py-3 pr-2 text-right font-sans">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        inc.severity === 'Resolved'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : inc.severity === 'Warning'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {inc.severity}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
