import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Download, Trash2, RefreshCw, AlertCircle, CheckCircle, FileText, Zap, Clock, Shield, Ship, Package, Users } from 'lucide-react';

const API_BASE = '/api';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  steps: TemplateStep[];
  created_at: string;
  is_default: boolean;
}

interface TemplateStep {
  id?: number;
  title: string;
  description: string;
  required_fields: string[];
  assignee_role: string;
  estimated_duration: number;
}

const TEMPLATE_CATEGORIES = [
  { value: 'import', label: 'Import Process', icon: Ship },
  { value: 'export', label: 'Export Process', icon: Package },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'verification', label: 'Verification', icon: Users },
  { value: 'custom', label: 'Custom', icon: FileText },
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Standard Import Workflow',
    description: 'Complete import document processing from submission to approval',
    category: 'import',
    steps: [
      { title: 'Document Upload', description: 'Upload import documents', required_fields: ['invoice', 'bl', 'packing_list'], assignee_role: 'staff', estimated_duration: 30 },
      { title: 'Initial Review', description: 'Review uploaded documents', required_fields: [], assignee_role: 'staff', estimated_duration: 60 },
      { title: 'Customs Check', description: 'Verify customs compliance', required_fields: ['customs_declaration'], assignee_role: 'admin', estimated_duration: 120 },
      { title: 'Final Approval', description: 'Approve or reject import', required_fields: [], assignee_role: 'admin', estimated_duration: 30 },
    ],
  },
  {
    name: 'Express Import',
    description: 'Fast-track import for urgent shipments',
    category: 'import',
    steps: [
      { title: 'Priority Upload', description: 'Upload urgent documents', required_fields: ['invoice', 'bl'], assignee_role: 'staff', estimated_duration: 15 },
      { title: 'Expedited Review', description: 'Quick review process', required_fields: [], assignee_role: 'admin', estimated_duration: 30 },
      { title: 'Fast Approval', description: 'Expedited approval', required_fields: [], assignee_role: 'admin', estimated_duration: 15 },
    ],
  },
  {
    name: 'Standard Export SOP',
    description: 'Standard export processing workflow',
    category: 'export',
    steps: [
      { title: 'Export Declaration', description: 'Submit export documents', required_fields: ['invoice', 'packing_list'], assignee_role: 'staff', estimated_duration: 30 },
      { title: 'Quality Check', description: 'Verify export quality', required_fields: [], assignee_role: 'staff', estimated_duration: 45 },
      { title: 'Customs Clearance', description: 'Clear customs for export', required_fields: ['export_permit'], assignee_role: 'admin', estimated_duration: 90 },
    ],
  },
  {
    name: 'Customs Clearance',
    description: 'Myanmar customs declaration process',
    category: 'compliance',
    steps: [
      { title: 'Document Submission', description: 'Submit customs documents', required_fields: ['customs_form', 'invoice'], assignee_role: 'staff', estimated_duration: 45 },
      { title: 'Authority Review', description: 'Customs authority review', required_fields: [], assignee_role: 'admin', estimated_duration: 180 },
      { title: 'Clearance Decision', description: 'Grant or deny clearance', required_fields: [], assignee_role: 'admin', estimated_duration: 60 },
    ],
  },
  {
    name: 'FDA Approval',
    description: 'Food & Drug approval workflow',
    category: 'compliance',
    steps: [
      { title: 'Application Submission', description: 'Submit FDA application', required_fields: ['application_form', 'lab_report'], assignee_role: 'staff', estimated_duration: 60 },
      { title: 'Lab Verification', description: 'Verify lab results', required_fields: [], assignee_role: 'staff', estimated_duration: 120 },
      { title: 'FDA Review', description: 'FDA authority review', required_fields: [], assignee_role: 'admin', estimated_duration: 240 },
      { title: 'Approval Decision', description: 'Grant or deny approval', required_fields: [], assignee_role: 'admin', estimated_duration: 60 },
    ],
  },
  {
    name: 'NRC Verification',
    description: 'National Registration Card verification',
    category: 'verification',
    steps: [
      { title: 'NRC Submission', description: 'Submit NRC document', required_fields: ['nrc_document'], assignee_role: 'staff', estimated_duration: 30 },
      { title: 'Identity Check', description: 'Verify identity information', required_fields: [], assignee_role: 'staff', estimated_duration: 45 },
      { title: 'Database Verification', description: 'Check against database', required_fields: [], assignee_role: 'admin', estimated_duration: 60 },
    ],
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

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New template form state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('custom');
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([
    { title: '', description: '', required_fields: [], assignee_role: 'staff', estimated_duration: 30 }
  ]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        // Load default templates if API fails
        const defaultTemplates = DEFAULT_TEMPLATES.map((t, index) => ({
          id: index + 1,
          ...t,
          created_at: new Date().toISOString(),
          is_default: true,
        }));
        setTemplates(defaultTemplates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Load default templates on error
      const defaultTemplates = DEFAULT_TEMPLATES.map((t, index) => ({
        id: index + 1,
        ...t,
        created_at: new Date().toISOString(),
        is_default: true,
      }));
      setTemplates(defaultTemplates);
    } finally {
      setLoading(false);
    }
  }

  async function createTemplate() {
    try {
      setError(null);
      const response = await apiFetch(`${API_BASE}/templates`, {
        method: 'POST',
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          category: templateCategory,
          steps: templateSteps,
        }),
      });

      if (response.ok) {
        setSuccess('Template created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadTemplates();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create template');
      }
    } catch (err) {
      setError('Error creating template');
      console.error('Failed to create template:', err);
    }
  }

  async function deleteTemplate(templateId: number) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await apiFetch(`${API_BASE}/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  }

  async function instantiateTemplate(templateId: number) {
    try {
      const response = await apiFetch(`${API_BASE}/templates/${templateId}/instantiate`, {
        method: 'POST',
      });

      if (response.ok) {
        setSuccess('Template instantiated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to instantiate template');
      console.error('Failed to instantiate template:', err);
    }
  }

  async function exportTemplate(templateId: number) {
    try {
      const response = await apiFetch(`${API_BASE}/templates/${templateId}/export`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-${templateId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to export template');
      console.error('Failed to export template:', err);
    }
  }

  function addStep() {
    setTemplateSteps([...templateSteps, { title: '', description: '', required_fields: [], assignee_role: 'staff', estimated_duration: 30 }]);
  }

  function removeStep(index: number) {
    setTemplateSteps(templateSteps.filter((_, i) => i !== index));
  }

  function updateStep<K extends Exclude<keyof TemplateStep, 'id'>>(
    index: number,
    field: K,
    value: TemplateStep[K]
  ) {
    const newSteps = [...templateSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setTemplateSteps(newSteps);
  }

  function resetForm() {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateSteps([{ title: '', description: '', required_fields: [], assignee_role: 'staff', estimated_duration: 30 }]);
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const totalEstimatedTime = (steps: TemplateStep[]) => 
    steps.reduce((sum, step) => sum + step.estimated_duration, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 font-mono text-sm animate-pulse">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="doka-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <FileText className="h-4 w-4" /> SOP Automation Blueprint
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Workflow Template Library</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Pre-configured process blueprints for Myanmar customs clearance, NRC identity KYC, and automated tax audits.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadTemplates} variant="outline" size="sm" className="h-10 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
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

      {/* Category Filter */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-xl text-xs ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            All Templates
          </Button>
          {TEMPLATE_CATEGORIES.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={`rounded-xl text-xs ${
                selectedCategory === category.value
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <Card className="rounded-2xl border border-emerald-500/30 bg-[#0E1420] shadow-xl p-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-800">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
              Create Standard Operating Procedure Template
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Express Port Ingest & Tax Audit"
                    className="border-slate-700 bg-slate-900 text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Description</Label>
                  <Input
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe this workflow's compliance and operational intent..."
                    className="border-slate-700 bg-slate-900 text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Category</Label>
                  <Select value={templateCategory} onValueChange={setTemplateCategory}>
                    <SelectTrigger className="border-slate-700 bg-slate-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-[#0E1420] text-white">
                      {TEMPLATE_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-white">Workflow Step Sequence</Label>
                  <Button onClick={addStep} size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                {templateSteps.map((step, index) => (
                  <div key={index} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                        Stage {index + 1}
                      </Badge>
                      <Button
                        onClick={() => removeStep(index)}
                        variant="ghost"
                        size="icon"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ml-auto h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Step Title</Label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                          placeholder="e.g., Cryptographic Verification"
                          className="border-slate-700 bg-slate-900 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Assignee Role</Label>
                        <Select
                          value={step.assignee_role}
                          onValueChange={(value) => updateStep(index, 'assignee_role', value)}
                        >
                          <SelectTrigger className="border-slate-700 bg-slate-900 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-slate-800 bg-[#0E1420] text-white">
                            <SelectItem value="staff">Staff Operator</SelectItem>
                            <SelectItem value="admin">Compliance Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button onClick={createTemplate} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  Create Template
                </Button>
                <Button onClick={() => { setShowCreateDialog(false); resetForm(); }} variant="outline" className="border-slate-700 text-slate-300 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.value === template.category) || TEMPLATE_CATEGORIES[0];
          return (
            <Card key={template.id} className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-5 hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      <categoryInfo.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{template.name}</h3>
                      <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                  {template.is_default && (
                    <Badge variant="outline" className="border-slate-700 bg-slate-800 text-[10px] font-mono text-slate-400">
                      VERIFIED
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{template.description}</p>
                <div className="space-y-2 py-3 border-y border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pipeline Stages</span>
                    <span className="font-mono font-bold text-white">{template.steps.length} Steps</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated SLA</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {totalEstimatedTime(template.steps)} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => instantiateTemplate(template.id)}
                  size="sm"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Deploy SOP
                </Button>
                <Button
                  onClick={() => exportTemplate(template.id)}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl"
                >
                  <Download className="w-4 h-4" />
                </Button>
                {!template.is_default && (
                  <Button
                    onClick={() => deleteTemplate(template.id)}
                    size="sm"
                    variant="ghost"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="rounded-2xl border border-slate-800/80 bg-[#0E1420]/90 shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">
            No Templates in Category
          </h3>
          <p className="text-sm text-slate-400">
            Create a custom process template or choose another filter.
          </p>
        </Card>
      )}
    </div>
  );
}
