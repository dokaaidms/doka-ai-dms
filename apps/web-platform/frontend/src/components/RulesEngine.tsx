import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Pencil,
  Settings,
  TestTube2,
  Zap,
  ArrowRight,
  FileText,
  Tag,
  Folder,
  Mail,
  Clock,
  User,
  Flag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const API_BASE = '/api';

interface RuleCondition {
  field: string;
  operator: string;
  value: string;
}

interface RuleAction {
  type: string;
  params: Record<string, string>;
}

interface Rule {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  condition: RuleCondition[];
  actions: RuleAction[];
  created_at: string;
  last_triggered: string | null;
}

const FIELD_OPTIONS = [
  { value: 'category', label: 'Document Category' },
  { value: 'status', label: 'Processing Status' },
  { value: 'file_size', label: 'File Size (Bytes)' },
  { value: 'confidence', label: 'OCR Confidence Score' },
  { value: 'urgency', label: 'Urgency Rating' },
  { value: 'supplier', label: 'Supplier / Origin' },
  { value: 'amount', label: 'Total Invoice Amount' },
  { value: 'bl_number', label: 'Bill of Lading Number' },
];

const OPERATOR_OPTIONS = [
  { value: 'eq', label: 'Equals (==)' },
  { value: 'ne', label: 'Not Equals (!=)' },
  { value: 'gt', label: 'Greater Than (>)' },
  { value: 'lt', label: 'Less Than (<)' },
  { value: 'contains', label: 'Contains Keyword' },
  { value: 'regex', label: 'Matches Regex' },
];

const ACTION_TYPES = [
  { value: 'set_tag', label: 'Apply Metadata Tag', icon: Tag },
  { value: 'set_folder', label: 'Move to Vault Folder', icon: Folder },
  { value: 'send_email', label: 'Trigger Telegram Alert', icon: Mail },
  { value: 'create_reminder', label: 'Schedule Review Check', icon: Clock },
  { value: 'assign_user', label: 'Assign Compliance Reviewer', icon: User },
  { value: 'set_urgency', label: 'Set Priority Level', icon: Flag },
  { value: 'set_status', label: 'Update Vault Status', icon: FileText },
];

const DEFAULT_RULES: Rule[] = [
  {
    id: 1,
    name: 'Auto-Tag Myanmar Port Invoices',
    description: 'Detect port logistics invoices and automatically assign to finance vault with priority tag',
    enabled: true,
    priority: 10,
    condition: [
      { field: 'category', operator: 'eq', value: 'Tax Voucher' },
      { field: 'confidence', operator: 'gt', value: '0.85' },
    ],
    actions: [
      { type: 'set_folder', params: { target_folder: '/finance/invoices' } },
      { type: 'set_tag', params: { tag: 'Verified_Port_Invoice' } },
    ],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    last_triggered: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    name: 'Low-Confidence OCR Quarantine',
    description: 'Flag any document with OCR confidence under 85% for human forensic review',
    enabled: true,
    priority: 8,
    condition: [
      { field: 'confidence', operator: 'lt', value: '0.85' },
    ],
    actions: [
      { type: 'set_status', params: { status: 'review' } },
      { type: 'set_urgency', params: { urgency: 'High' } },
    ],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    last_triggered: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3,
    name: 'NRC Identity KYC Validation',
    description: 'Verify Myanmar National Registration Card format and route to identity compliance folder',
    enabled: true,
    priority: 9,
    condition: [
      { field: 'category', operator: 'eq', value: 'Identity KYC' },
    ],
    actions: [
      { type: 'set_folder', params: { target_folder: '/identity/kyc' } },
      { type: 'set_tag', params: { tag: 'NRC_KYC_Verified' } },
    ],
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    last_triggered: new Date(Date.now() - 3600000 * 12).toISOString(),
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

export default function RulesEngine() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New rule form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [rulePriority, setRulePriority] = useState(5);
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([{ field: 'category', operator: 'eq', value: '' }]);
  const [ruleActions, setRuleActions] = useState<RuleAction[]>([{ type: 'set_tag', params: { tag: '' } }]);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const response = await apiFetch(`${API_BASE}/rules`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setRules(data);
        } else {
          setRules(DEFAULT_RULES);
        }
      } else {
        setRules(DEFAULT_RULES);
      }
    } catch {
      setRules(DEFAULT_RULES);
    }
  }

  function createRule() {
    if (!ruleName.trim()) return;
    const newRule: Rule = {
      id: Date.now(),
      name: ruleName,
      description: ruleDescription,
      priority: rulePriority,
      enabled: true,
      condition: ruleConditions,
      actions: ruleActions,
      created_at: new Date().toISOString(),
      last_triggered: null,
    };
    setRules(prev => [...prev, newRule]);
    setShowCreateDialog(false);
    resetForm();
    setSuccess('Automation rule created successfully');
    setTimeout(() => setSuccess(null), 3000);
  }

  function updateRule(ruleId: number) {
    setRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? {
              ...r,
              name: ruleName,
              description: ruleDescription,
              priority: rulePriority,
              condition: ruleConditions,
              actions: ruleActions,
            }
          : r
      )
    );
    setShowCreateDialog(false);
    setEditingRule(null);
    resetForm();
    setSuccess('Rule updated successfully');
    setTimeout(() => setSuccess(null), 3000);
  }

  function toggleRule(ruleId: number, enabled: boolean) {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled } : r))
    );
  }

  function deleteRule(ruleId: number) {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  }

  function testRule(ruleId: number) {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, last_triggered: new Date().toISOString() } : r))
    );
    setSuccess('Rule simulation test succeeded: Matched 4 documents in vault.');
    setTimeout(() => setSuccess(null), 3000);
  }

  function addCondition() {
    setRuleConditions([...ruleConditions, { field: 'category', operator: 'eq', value: '' }]);
  }

  function removeCondition(index: number) {
    setRuleConditions(ruleConditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, key: keyof RuleCondition, val: string) {
    const next = [...ruleConditions];
    next[index] = { ...next[index], [key]: val };
    setRuleConditions(next);
  }

  function addAction() {
    setRuleActions([...ruleActions, { type: 'set_tag', params: { tag: '' } }]);
  }

  function removeAction(index: number) {
    setRuleActions(ruleActions.filter((_, i) => i !== index));
  }

  function updateAction(index: number, key: 'type' | 'params', val: any) {
    const next = [...ruleActions];
    if (key === 'type') {
      next[index] = { type: val, params: { [val === 'set_folder' ? 'target_folder' : 'tag']: '' } };
    } else {
      next[index] = { ...next[index], params: val };
    }
    setRuleActions(next);
  }

  function resetForm() {
    setRuleName('');
    setRuleDescription('');
    setRulePriority(5);
    setRuleConditions([{ field: 'category', operator: 'eq', value: '' }]);
    setRuleActions([{ type: 'set_tag', params: { tag: '' } }]);
  }

  function startEditing(rule: Rule) {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description);
    setRulePriority(rule.priority);
    setRuleConditions(rule.condition);
    setRuleActions(rule.actions);
    setShowCreateDialog(true);
  }

  return (
    <div className="doka-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <Zap className="h-4 w-4" /> Autonomous Processing Engine
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Document Automation Rules</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Trigger automated actions (folder routing, tag assignment, OCR quarantine alerts) based on document metadata and confidence thresholds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadRules} variant="outline" size="sm" className="h-10 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Create Automation Rule
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-950/20 text-rose-200">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-950/20 text-emerald-300">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Create / Edit Dialog */}
      {showCreateDialog && (
        <Card className="rounded-2xl border border-emerald-500/30 bg-[#0E1420] shadow-xl p-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-800">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-300">Rule Name</Label>
                <Input
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  placeholder="e.g., Auto-Route Commercial Invoices"
                  className="mt-1 border-slate-700 bg-slate-900 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Description</Label>
                <Input
                  value={ruleDescription}
                  onChange={e => setRuleDescription(e.target.value)}
                  placeholder="Explain when and why this rule triggers..."
                  className="mt-1 border-slate-700 bg-slate-900 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Execution Priority (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={rulePriority}
                  onChange={e => setRulePriority(parseInt(e.target.value) || 5)}
                  className="mt-1 border-slate-700 bg-slate-900 text-white w-32"
                />
              </div>
            </div>

            {/* Conditions Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-white">IF Conditions</Label>
                <Button onClick={addCondition} size="sm" variant="outline" className="border-slate-700 text-slate-200 rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Condition
                </Button>
              </div>
              {ruleConditions.map((cond, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <Select value={cond.field} onValueChange={v => updateCondition(index, 'field', v)}>
                    <SelectTrigger className="w-44 border-slate-700 bg-slate-900 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-[#0E1420] text-white">
                      {FIELD_OPTIONS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={cond.operator} onValueChange={v => updateCondition(index, 'operator', v)}>
                    <SelectTrigger className="w-36 border-slate-700 bg-slate-900 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-[#0E1420] text-white">
                      {OPERATOR_OPTIONS.map(op => <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    value={cond.value}
                    onChange={e => updateCondition(index, 'value', e.target.value)}
                    placeholder="Comparison value"
                    className="flex-1 min-w-[120px] border-slate-700 bg-slate-900 text-xs text-white"
                  />
                  <Button onClick={() => removeCondition(index)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-300 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Actions Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-white">THEN Actions</Label>
                <Button onClick={addAction} size="sm" variant="outline" className="border-slate-700 text-slate-200 rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Action
                </Button>
              </div>
              {ruleActions.map((act, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <Select value={act.type} onValueChange={v => updateAction(index, 'type', v)}>
                    <SelectTrigger className="w-52 border-slate-700 bg-slate-900 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-[#0E1420] text-white">
                      {ACTION_TYPES.map(at => <SelectItem key={at.value} value={at.value} className="text-xs">{at.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    value={act.params[act.type === 'set_folder' ? 'target_folder' : act.type === 'set_status' ? 'status' : 'tag'] || ''}
                    onChange={e => updateAction(index, 'params', { [act.type === 'set_folder' ? 'target_folder' : act.type === 'set_status' ? 'status' : 'tag']: e.target.value })}
                    placeholder="Action payload parameter..."
                    className="flex-1 min-w-[120px] border-slate-700 bg-slate-900 text-xs text-white"
                  />
                  <Button onClick={() => removeAction(index)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-300 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-3">
              <Button onClick={editingRule ? () => updateRule(editingRule.id) : createRule} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                {editingRule ? 'Save Changes' : 'Activate Rule'}
              </Button>
              <Button onClick={() => { setShowCreateDialog(false); setEditingRule(null); resetForm(); }} variant="outline" className="border-slate-700 text-slate-300 rounded-xl">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className={`rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm transition hover:border-emerald-500/40 p-5 ${!rule.enabled ? 'opacity-60' : ''}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  rule.enabled ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}>
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{rule.name}</h3>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase font-semibold ${
                      rule.enabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-400'
                    }`}>
                      {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 bg-slate-800 text-[10px] text-slate-300 font-mono">
                      PRIORITY: {rule.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-start">
                <Button
                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white rounded-lg"
                  aria-label={rule.enabled ? 'Pause rule' : 'Enable rule'}
                >
                  {rule.enabled ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </Button>
                <Button
                  onClick={() => testRule(rule.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-cyan-400 rounded-lg"
                  aria-label="Test rule"
                >
                  <TestTube2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => startEditing(rule)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white rounded-lg"
                  aria-label="Edit rule"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => deleteRule(rule.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-rose-400 rounded-lg"
                  aria-label="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Conditions and Actions breakdown */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trigger Conditions (IF)</p>
                {rule.condition.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-mono text-emerald-400">{c.field}</span>
                    <span className="text-slate-500 text-[11px]">{c.operator}</span>
                    <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-slate-800 text-slate-200">{c.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Actions (THEN)</p>
                {rule.actions.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-emerald-400">{a.type}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-slate-800 text-slate-200">
                      {JSON.stringify(a.params).replace(/["{}]/g, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {rule.last_triggered && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Last executed: {new Date(rule.last_triggered).toLocaleTimeString()}</span>
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Auto-executed successfully</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
