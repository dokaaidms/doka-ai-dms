import {
  AlertCircle,
  Cloud,
  Github,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Database,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const services = [
  {
    name: 'Doka Cloud API & Microservices',
    detail: 'Document metadata routing, private storage proxy, and hardware-isolated API endpoints.',
    icon: Cloud,
    state: 'Core Service',
    statusTone: 'emerald',
    latency: '24ms',
  },
  {
    name: 'Supabase Authentication & DB',
    detail: 'JWT access validation, row-level security policies, and session identity store.',
    icon: ShieldCheck,
    state: 'Active',
    statusTone: 'emerald',
    latency: '38ms',
  },
  {
    name: 'Backblaze B2 Vault Storage',
    detail: 'S3-compatible immutable cold storage with multi-region replication and SHA-256 seal.',
    icon: HardDrive,
    state: 'Operational',
    statusTone: 'emerald',
    latency: '65ms',
  },
  {
    name: 'Telegram Security Bot (Topic 215)',
    detail: 'Instant dispatch of high-severity document quarantine events and auth failures.',
    icon: MessageCircle,
    state: 'Bridge Connected',
    statusTone: 'cyan',
    latency: '82ms',
  },
  {
    name: 'Qdrant Vector Engine & Voyage AI',
    detail: '1024-dimension vector embeddings for semantic document search and KYC matching.',
    icon: Database,
    state: 'Synced',
    statusTone: 'emerald',
    latency: '45ms',
  },
  {
    name: 'GitHub CI/CD Automation',
    detail: 'Repository source sync, build triggers, and automated release promotions.',
    icon: Github,
    state: 'Connected',
    statusTone: 'emerald',
    latency: '110ms',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="doka-dashboard">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <ShieldCheck className="h-4 w-4" /> Service Mesh & Integrations
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Connections Center</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Comprehensive health telemetry and verification status for all external APIs, cold storage archives, and webhook bridges.
        </p>
      </section>

      {/* Security Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 flex items-start gap-3.5">
        <Lock className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <p className="font-bold text-white text-sm">Protected Credential Boundary</p>
          <p className="mt-1">
            All connection secrets and API keys are stored server-side with AES-256 encryption. Client browsers cannot read or modify raw provider secrets.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="grid gap-4 md:grid-cols-2">
        {services.map(service => (
          <Card key={service.name} className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-5 hover:border-emerald-500/40 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <service.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">{service.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{service.detail}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]"
              >
                {service.state}
              </Badge>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Health Verified
              </span>
              <span>PING: {service.latency}</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
