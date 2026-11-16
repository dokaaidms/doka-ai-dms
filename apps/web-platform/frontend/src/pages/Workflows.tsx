import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ScanText,
  ShieldCheck,
  Sparkles,
  Layers,
  Send,
  Database,
  Cloud,
  ChevronRight,
  Terminal,
  Trash2,
  Sliders,
  Cpu,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

export interface StaticStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  category: 'Ingestion' | 'OCR' | 'Security' | 'AI Parse' | 'Embedding' | 'Approval' | 'Search' | 'Storage';
  enabled: boolean;
  estimatedLatency: string;
  icon: React.ElementType;
  description: string;
  specs: {
    engine: string;
    throughput: string;
    compliance: string;
  };
}

const DEFAULT_STAGES: StaticStage[] = [
  {
    id: 'doka-stage-1',
    stageNumber: 1,
    title: 'Document Ingestion',
    subtitle: 'Multi-Format Inbound Watcher',
    category: 'Ingestion',
    enabled: true,
    estimatedLatency: '120 ms',
    icon: FileText,
    description: 'Watches drag-and-drop dropzones and S3 inbound buckets. Handles PDF, DOCX, TIFF, and camera scan uploads.',
    specs: {
      engine: 'Direct S3 / Local Buffer',
      throughput: '100 MB / batch',
      compliance: 'Zero Local Leakage',
    },
  },
  {
    id: 'doka-stage-2',
    stageNumber: 2,
    title: 'Neural OCR Engine',
    subtitle: 'Bilingual Myanmar & English',
    category: 'OCR',
    enabled: true,
    estimatedLatency: '340 ms',
    icon: ScanText,
    description: 'High-precision OCR with Poppler & Tesseract. Specialized font detection for Myanmar Unicode, Zawgyi, and English.',
    specs: {
      engine: 'Tesseract 5.3 + Poppler',
      throughput: '45 pages / min',
      compliance: 'DPI Auto-Normalization',
    },
  },
  {
    id: 'doka-stage-3',
    stageNumber: 3,
    title: 'PII & Redaction Masker',
    subtitle: 'AES-256 GCM Compliance Gate',
    category: 'Security',
    enabled: true,
    estimatedLatency: '180 ms',
    icon: ShieldCheck,
    description: 'Automatically scans and redacts National Registration Card (NRC) numbers, bank accounts, and phone numbers.',
    specs: {
      engine: 'AES-GCM 256-bit Tokenizer',
      throughput: 'Realtime Streaming',
      compliance: 'GDPR / Enterprise Ready',
    },
  },
  {
    id: 'doka-stage-4',
    stageNumber: 4,
    title: 'Gemini Entity Parser',
    subtitle: 'Structured Schema Extraction',
    category: 'AI Parse',
    enabled: true,
    estimatedLatency: '420 ms',
    icon: Sparkles,
    description: 'Gemini 2.5 multimodal intelligence extracts structured invoice fields, tax identifiers, dates, and line items.',
    specs: {
      engine: 'Gemini 2.5 Flash / Pro',
      throughput: '1M Token Context',
      compliance: 'JSON Schema Enforced',
    },
  },
  {
    id: 'doka-stage-5',
    stageNumber: 5,
    title: 'Vector Embedding Engine',
    subtitle: '1024-dim Semantic Vectors',
    category: 'Embedding',
    enabled: true,
    estimatedLatency: '260 ms',
    icon: Layers,
    description: 'Generates high-dimensional dense vector embeddings for deep semantic search across unstructured documentation.',
    specs: {
      engine: 'Voyage AI voyage-3',
      throughput: '1024 Dimensions',
      compliance: 'Normalized Cosine Dot',
    },
  },
  {
    id: 'doka-stage-6',
    stageNumber: 6,
    title: 'Telegram Approval Gate',
    subtitle: 'Human-in-the-Loop Audit',
    category: 'Approval',
    enabled: false, // Default bypassed
    estimatedLatency: 'Bypassed',
    icon: Send,
    description: 'Optional manual verification gate. Sends interactive callback buttons to approved Telegram channels for critical approvals.',
    specs: {
      engine: 'Telegram Bot API / Topic 6',
      throughput: 'Instant Push Alert',
      compliance: '2-Factor Digital Signoff',
    },
  },
  {
    id: 'doka-stage-7',
    stageNumber: 7,
    title: 'Hybrid Search Index',
    subtitle: 'PostgreSQL + Qdrant Cloud',
    category: 'Search',
    enabled: true,
    estimatedLatency: '190 ms',
    icon: Database,
    description: 'Combines full-text inverted indexes with vector similarity for sub-second retrieval across millions of records.',
    specs: {
      engine: 'pgvector + Qdrant Cloud',
      throughput: '< 15 ms Query Latency',
      compliance: 'HNSW Graph Indexing',
    },
  },
  {
    id: 'doka-stage-8',
    stageNumber: 8,
    title: 'Encrypted Cloud Vault',
    subtitle: 'Backblaze B2 & WORM Archive',
    category: 'Storage',
    enabled: true,
    estimatedLatency: '310 ms',
    icon: Cloud,
    description: 'Immutable long-term storage with tamper-proof SHA-256 checksums and automated Backblaze B2 replication.',
    specs: {
      engine: 'Backblaze B2 + Supabase',
      throughput: 'Unlimited Cold Storage',
      compliance: '7-Year WORM Immutability',
    },
  },
];

interface LogEntry {
  id: string;
  time: string;
  stageName: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export default function WorkflowsPage() {
  const [stages, setStages] = useState<StaticStage[]>(DEFAULT_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<string>('doka-stage-1');
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunningId, setActiveRunningId] = useState<string | null>(null);
  const [completedStageIds, setCompletedStageIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      time: '09:00:00',
      stageName: 'DOKA-PIPELINE',
      message: 'Zero-Code 8-Stage Document Automation Pipeline initialized.',
      type: 'info',
    },
    {
      id: 'log-2',
      time: '09:00:01',
      stageName: 'TELEGRAM GATE',
      message: 'Stage 6 (Telegram Approval Gate) is set to BYPASS — routing directly to Hybrid Search Index.',
      type: 'warn',
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

  const handleToggleStage = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStages(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const nextState = !s.enabled;
        const logMsg: LogEntry = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          stageName: s.title.toUpperCase(),
          message: nextState
            ? `Stage activated in pipeline bus.`
            : `Stage DEACTIVATED — auto-bypass arc enabled.`,
          type: nextState ? 'info' : 'warn',
        };
        setLogs(l => [...l, logMsg]);
        return {
          ...s,
          enabled: nextState,
          estimatedLatency: nextState ? (s.id === 'doka-stage-6' ? '450 ms' : s.estimatedLatency) : 'Bypassed',
        };
      })
    );
  };

  const handleResetDefaults = () => {
    setStages(DEFAULT_STAGES);
    setCompletedStageIds([]);
    setActiveRunningId(null);
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        stageName: 'PIPELINE CONFIG',
        message: 'Pipeline reset to recommended factory configuration.',
        type: 'info',
      },
    ]);
  };

  const handleRunSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedStageIds([]);
    setActiveRunningId(null);

    const activeStages = stages.filter(s => s.enabled);
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        stageName: 'SIMULATOR',
        message: `Starting automated run for test document "NRC_KYC_Contract_2026.pdf" (${activeStages.length} active stages)...`,
        type: 'info',
      },
    ]);

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (!stage.enabled) {
        setLogs(prev => [
          ...prev,
          {
            id: `log-${Date.now()}-${i}`,
            time: new Date().toLocaleTimeString(),
            stageName: stage.title.toUpperCase(),
            message: `[BYPASS] Stage ${stage.stageNumber} disabled — auto-routing around node.`,
            type: 'warn',
          },
        ]);
        continue;
      }

      setActiveRunningId(stage.id);
      setSelectedStageId(stage.id);
      setLogs(prev => [
        ...prev,
        {
          id: `log-${Date.now()}-${i}`,
          time: new Date().toLocaleTimeString(),
          stageName: stage.title.toUpperCase(),
          message: `Executing stage [${stage.stageNumber}/8]: ${stage.subtitle}...`,
          type: 'info',
        },
      ]);

      await new Promise(r => setTimeout(r, 650));

      setCompletedStageIds(prev => [...prev, stage.id]);
      setLogs(prev => [
        ...prev,
        {
          id: `log-done-${Date.now()}-${i}`,
          time: new Date().toLocaleTimeString(),
          stageName: stage.title.toUpperCase(),
          message: `Stage ${stage.stageNumber} finished successfully (telemetry verified).`,
          type: 'success',
        },
      ]);
    }

    setActiveRunningId(null);
    setIsRunning(false);
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-finish`,
        time: new Date().toLocaleTimeString(),
        stageName: 'SIMULATOR',
        message: 'Pipeline execution complete. Document encrypted and indexed.',
        type: 'success',
      },
    ]);
  };

  const activeCount = stages.filter(s => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0d131f] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Document Processing Pipeline</h1>
            <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
              Zero-Code Static Engine
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {activeCount} of {stages.length} stages active · Auto-bypass routing enabled · Zero local data leakage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={isRunning}
            className="h-9 rounded-xl border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500"
          >
            <Play className={`mr-1.5 h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Processing...' : 'Run Pipeline Simulation'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Pipeline Canvas & Telemetry Log */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left: 8-Stage Visual Pipeline */}
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Pre-built Zero-Code Pipeline: Toggle any stage to bypass it. Traffic automatically routes around disabled nodes.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Bypassed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map(stage => {
              const isSelected = selectedStageId === stage.id;
              const isRunningThis = activeRunningId === stage.id;
              const isCompleted = completedStageIds.includes(stage.id);
              const StageIcon = stage.icon;

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.18)]'
                      : stage.enabled
                      ? 'border-slate-800 bg-[#0d131f] hover:border-slate-700 hover:bg-[#11192a]'
                      : 'border-slate-800/60 bg-[#0a0e17] opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* Top Bar: Stage Number & Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Stage {stage.stageNumber}
                    </span>
                    <Switch
                      checked={stage.enabled}
                      onCheckedChange={() => handleToggleStage(stage.id)}
                      onClick={e => e.stopPropagation()}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  {/* Stage Icon & Title */}
                  <div className="mt-3 flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isRunningThis
                          ? 'animate-pulse bg-blue-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : stage.enabled
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <StageIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{stage.title}</p>
                      <p className="truncate text-[11px] text-slate-400">{stage.subtitle}</p>
                    </div>
                  </div>

                  {/* Bottom Metrics & Status */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/70 pt-2.5 text-[11px]">
                    {stage.enabled ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                        <span>{isCompleted ? 'Passed' : 'Ready'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Bypassed</span>
                      </span>
                    )}
                    <span className="font-mono text-slate-400">{stage.estimatedLatency}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Inspector Panel */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <selectedStage.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Stage {selectedStage.stageNumber}: {selectedStage.title}
                    </h3>
                    <Badge
                      className={
                        selectedStage.enabled
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]'
                      }
                    >
                      {selectedStage.enabled ? 'Active In Bus' : 'Bypassed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{selectedStage.subtitle}</p>
                </div>
              </div>

              <Button
                variant={selectedStage.enabled ? 'destructive' : 'default'}
                size="sm"
                onClick={() => handleToggleStage(selectedStage.id)}
                className={`h-9 rounded-xl text-xs font-semibold ${
                  selectedStage.enabled
                    ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {selectedStage.enabled ? 'Deactivate (Bypass)' : 'Activate Stage'}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800/80 bg-[#090d16] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ENGINE & ROUTING</p>
                <p className="mt-1.5 text-xs font-semibold text-slate-200">{selectedStage.specs.engine}</p>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{selectedStage.description}</p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#090d16] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">THROUGHPUT & CAPACITY</p>
                <p className="mt-1.5 text-xs font-semibold text-blue-400">{selectedStage.specs.throughput}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Estimated Latency: <span className="font-mono text-slate-200">{selectedStage.estimatedLatency}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#090d16] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">COMPLIANCE & INTEGRITY</p>
                <p className="mt-1.5 text-xs font-semibold text-emerald-400">{selectedStage.specs.compliance}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Routing State:{' '}
                  <span className="font-semibold text-slate-200">
                    {selectedStage.enabled ? 'Direct Execution' : 'Auto-Bypass Enabled'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Log Terminal */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#0a0e17] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Pipeline Telemetry Log</span>
            </div>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              {logs.length} entries
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] max-h-[580px]">
            {logs.map(log => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-slate-500 mr-2">{log.time}</span>
                <span
                  className={
                    log.type === 'success'
                      ? 'text-emerald-400 font-semibold'
                      : log.type === 'warn'
                      ? 'text-amber-400 font-semibold'
                      : 'text-blue-400 font-semibold'
                  }
                >
                  [{log.stageName}]
                </span>{' '}
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          <div className="border-t border-slate-800 p-2.5 flex items-center justify-between bg-[#080b12]">
            <span className="text-[10px] text-slate-500">
              Status: <span className="text-emerald-400 font-medium">{isRunning ? 'Running' : 'Idle'}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogs([])}
              className="h-7 text-[10px] text-slate-400 hover:text-white"
            >
              <Trash2 className="mr-1 h-3 w-3" /> Clear Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
