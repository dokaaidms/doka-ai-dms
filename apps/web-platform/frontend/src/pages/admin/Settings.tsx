import { Link } from 'react-router';
import {
  ArrowRight,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Key,
  Database,
  Lock,
  Globe,
  Bell,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="doka-dashboard">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <SlidersHorizontal className="h-4 w-4" /> System Preferences
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Workspace Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Manage system theme, zero-trust account security parameters, and cryptographic vault connectors.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appearance Card */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Palette className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Appearance & Display</h3>
                <p className="mt-0.5 text-xs text-slate-400">Select display theme or obsidian dark mode.</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Obsidian Dark Theme</span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                ACTIVE
              </Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Tailored for low-light enterprise operations with high-contrast emerald highlights and WCAG 2.1 AAA accessibility.
            </p>
          </div>
        </Card>

        {/* Security Isolation Card */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Zero-Trust Isolation</h3>
                <p className="mt-0.5 text-xs text-slate-400">Hardware and session-scoped protection.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
              ENFORCED
            </Badge>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-300 leading-relaxed">
              Every document object key is cryptographically signed with SHA-256 tokens. Credentials are saved in server memory or microVM environment, never exposed to client runtime.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-emerald-400 font-mono">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> End-to-End TLS 1.3</span>
              <span className="flex items-center gap-1">• Strict Origin Access</span>
            </div>
          </div>
        </Card>

        {/* Connections Center Banner */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <SlidersHorizontal className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Connected Services & Webhook Bridges</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Inspect Doka Cloud API, Supabase, Backblaze B2, Telegram Alert Bot, and GitHub deployment automation.
                </p>
              </div>
            </div>
            <Link
              to="/admin/settings/integrations"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
            >
              Open Connections Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
