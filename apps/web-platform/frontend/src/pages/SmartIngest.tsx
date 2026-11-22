import { useState } from 'react';
import { 
  Receipt, Shield, MessageSquare, FileCheck, Search, 
  Send, RefreshCw, Upload, Eye, EyeOff, Check, AlertCircle, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ReceiptRecord {
  id: string;
  source: 'Telegram' | 'WhatsApp' | 'Manual Upload';
  vendor: string;
  date: string;
  currency: string;
  total: number;
  tax: number;
  category: string;
  status: 'Parsed' | 'Verified' | 'Pending';
}

interface CitationItem {
  docTitle: string;
  page: number;
  snippet: string;
}

export default function SmartIngest() {
  const [activeTab, setActiveTab] = useState<'receipts' | 'multidoc' | 'pii'>('receipts');

  // Receipt Scanner State
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([
    {
      id: 'REC-2026-001',
      source: 'Telegram',
      vendor: 'City Mart Holding Co., Ltd.',
      date: '2026-11-20',
      currency: 'MMK',
      total: 24150,
      tax: 1150,
      category: 'Retail & Groceries',
      status: 'Verified',
    },
    {
      id: 'REC-2026-002',
      source: 'WhatsApp',
      vendor: 'Grab Taxi Yangon',
      date: '2026-11-21',
      currency: 'MMK',
      total: 8500,
      tax: 0,
      category: 'Travel & Transport',
      status: 'Parsed',
    },
    {
      id: 'REC-2026-003',
      source: 'Manual Upload',
      vendor: 'Amazon Web Services (AWS)',
      date: '2026-11-19',
      currency: 'USD',
      total: 142.50,
      tax: 0,
      category: 'Cloud & Software',
      status: 'Verified',
    },
  ]);

  // Multi-Doc Chat State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(
    'Based on Document A [Quarterly Logistics Report, Page 4] and Document B [Vendor SLA, Page 12], cross-border customs turnaround improved by 34% following automated manifest clearance, reducing demurrage charges.'
  );
  const [chatCitations, setChatCitations] = useState<CitationItem[]>([
    { docTitle: 'Quarterly Logistics Report.pdf', page: 4, snippet: 'Customs turnaround improved by 34% on Southeast Asia maritime routes.' },
    { docTitle: 'Vendor SLA Agreement.pdf', page: 12, snippet: 'Demurrage waiver applies when automated manifest clearance is verified.' }
  ]);

  // PII Redaction State
  const [rawText, setRawText] = useState(
    'Vendor Invoice contact person is U Kyaw Zaw (NRC: 12/DAGAMA(N)123456). For payment settlement, call +95912345678 or write to billing@doka-dms.com. Backup card 4532-1100-8899-2345.'
  );
  const [redactedResult, setRedactedResult] = useState<string | null>(null);
  const [redactionStats, setRedactionStats] = useState<Record<string, number>>({});
  const [maskMode, setMaskMode] = useState<'tag' | 'mask'>('tag');

  const handleRunPIIRedaction = () => {
    let result = rawText;
    const stats: Record<string, number> = { nrc: 0, email: 0, phone: 0, card: 0 };

    // NRC
    const nrcRegex = /\b\d{1,2}\/[A-Za-z\u1000-\u1021]+(?:\([A-Za-z\u1000-\u1021]+\)|\([NnEePpTt]\)|နိုင်|ဧည်|ပြု)\d{6}\b/g;
    result = result.replace(nrcRegex, () => {
      stats.nrc += 1;
      return maskMode === 'tag' ? '[REDACTED_NRC]' : '**/***(N)******';
    });

    // Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
    result = result.replace(emailRegex, () => {
      stats.email += 1;
      return maskMode === 'tag' ? '[REDACTED_EMAIL]' : 'u***r@domain.com';
    });

    // Phone
    const phoneRegex = /(?:\+959|09|\+?1)[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g;
    result = result.replace(phoneRegex, () => {
      stats.phone += 1;
      return maskMode === 'tag' ? '[REDACTED_PHONE]' : '+959****78';
    });

    // Card
    const cardRegex = /\b(?:\d{4}[-\s]?){3}\d{1,4}\b/g;
    result = result.replace(cardRegex, () => {
      stats.card += 1;
      return maskMode === 'tag' ? '[REDACTED_CARD]' : '****-****-****-2345';
    });

    setRedactedResult(result);
    setRedactionStats(stats);
  };

  const handleSimulateNewReceipt = () => {
    const newRec: ReceiptRecord = {
      id: `REC-2026-00${receipts.length + 1}`,
      source: 'Telegram',
      vendor: 'Aroma Cafe & Bakery',
      date: '2026-11-22',
      currency: 'MMK',
      total: 12500,
      tax: 625,
      category: 'Meals & Entertainment',
      status: 'Parsed',
    };
    setReceipts([newRec, ...receipts]);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    setChatAnswer(
      `Direct Answer regarding "${chatQuestion}": Verified across 2 queried documents. Relevant provisions found in [Document Audit 2026, Page 2] and [Company Policy, Page 7].`
    );
    setChatCitations([
      { docTitle: 'Document Audit 2026.pdf', page: 2, snippet: 'Compliance verified with 100% adherence to digital ledger standards.' },
      { docTitle: 'Company Policy Manual.pdf', page: 7, snippet: 'Authorized signatures and receipt vouchers must be registered within 48 hours.' }
    ]);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Smart Ingest & PII Redaction</h1>
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs">
              AI Vision & Privacy
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated Telegram/WhatsApp receipt parsing, Multi-PDF Q&A with page citations, and Myanmar NRC PII masking.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
          <Button
            size="sm"
            variant={activeTab === 'receipts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('receipts')}
            className={`text-xs ${activeTab === 'receipts' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'text-slate-400'}`}
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            Receipt Ingestion
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'multidoc' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('multidoc')}
            className={`text-xs ${activeTab === 'multidoc' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'text-slate-400'}`}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            Multi-Doc Q&A
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'pii' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pii')}
            className={`text-xs ${activeTab === 'pii' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'text-slate-400'}`}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            PII Redactor
          </Button>
        </div>
      </div>

      {/* TAB 1: SMART RECEIPT INGESTION */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Automated Messaging Receipt Ledger</h2>
              <p className="text-xs text-slate-400">Incoming expenses from Telegram Bot and WhatsApp Business webhooks</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSimulateNewReceipt} className="text-xs border-slate-700 bg-slate-900">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Simulate Telegram Ingest
              </Button>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Source Channel</th>
                  <th className="py-3 px-4">Vendor / Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {receipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-cyan-300">{rec.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{rec.vendor}</td>
                    <td className="py-3 px-4 text-slate-400">{rec.category}</td>
                    <td className="py-3 px-4 text-slate-400">{rec.date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {rec.total.toLocaleString()} {rec.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rec.status === 'Verified' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-DOC AI Q&A WITH CITATIONS */}
      {activeTab === 'multidoc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  Ask Your Documents (Multi-PDF Synthesis)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Cross-document query engine returning exact page citations and evidence snippets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <Input
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="e.g. What were the key freight turnaround changes in Q3?"
                    className="bg-slate-950 border-slate-800 text-xs text-slate-200 focus-visible:ring-cyan-500"
                  />
                  <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Query
                  </Button>
                </form>

                {chatAnswer && (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      Synthesized Analysis
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{chatAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Citations Box */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Extracted Document Citations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chatCitations.map((cite, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate">{cite.docTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px] border border-cyan-500/20">
                        Page {cite.page}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">"{cite.snippet}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Active Corpus</CardTitle>
                <CardDescription className="text-xs text-slate-400">Selected documents for synthesis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="truncate flex-1">
                    <div className="font-medium text-slate-200 truncate">Quarterly Logistics Report.pdf</div>
                    <div className="text-[10px] text-slate-500">42 pages - Vectorized</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="truncate flex-1">
                    <div className="font-medium text-slate-200 truncate">Vendor SLA Agreement.pdf</div>
                    <div className="text-[10px] text-slate-500">18 pages - Vectorized</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="truncate flex-1">
                    <div className="font-medium text-slate-200 truncate">Document Audit 2026.pdf</div>
                    <div className="text-[10px] text-slate-500">8 pages - Vectorized</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: PII AUTO-REDACTION */}
      {activeTab === 'pii' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">PII Data Privacy & Sanitizer Engine</h2>
              <p className="text-xs text-slate-400">
                Detects and masks Myanmar NRC, Credit Cards, Phone numbers, and Emails before public sharing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mask Mode:</span>
              <Button
                size="sm"
                variant={maskMode === 'tag' ? 'default' : 'outline'}
                onClick={() => setMaskMode('tag')}
                className={`text-xs ${maskMode === 'tag' ? 'bg-cyan-600 text-white' : 'border-slate-800 text-slate-400'}`}
              >
                Tags [REDACTED]
              </Button>
              <Button
                size="sm"
                variant={maskMode === 'mask' ? 'default' : 'outline'}
                onClick={() => setMaskMode('mask')}
                className={`text-xs ${maskMode === 'mask' ? 'bg-cyan-600 text-white' : 'border-slate-800 text-slate-400'}`}
              >
                Asterisks (***)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Original Text / Document Extract</label>
              <Textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs text-slate-200 font-mono leading-relaxed"
              />
              <Button onClick={handleRunPIIRedaction} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs w-full">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Scan & Redact Sensitive PII
              </Button>
            </div>

            {/* Redacted Output Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Sanitized & Redacted Result</label>
              <div className="h-[188px] p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap">
                {redactedResult || 'Click "Scan & Redact Sensitive PII" to view the sanitized output.'}
              </div>
              {/* Audit Summary Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400">Redacted counts:</span>
                <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 text-[10px]">
                  NRC: {redactionStats.nrc ?? 0}
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px]">
                  Emails: {redactionStats.email ?? 0}
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px]">
                  Phones: {redactionStats.phone ?? 0}
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px]">
                  Cards: {redactionStats.card ?? 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
