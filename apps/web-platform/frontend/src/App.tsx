import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Skeleton } from '@/components/ui/skeleton';
import Login from '@/components/Login';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Toast';
import AdminLayout from '@/layouts/AdminLayout';
import PersonalDashboard from '@/pages/PersonalDashboard';
import WorkspaceReview from '@/pages/WorkspaceReview';
import CloudDocuments from '@/pages/CloudDocuments';
import SmartIngest from '@/pages/SmartIngest';
import CloudAudit from '@/pages/CloudAudit';
import AiUsage from '@/pages/AiUsage';
import TemplatesPage from '@/pages/admin/Templates';
import RulesPage from '@/pages/admin/Rules';
import PermissionsPage from '@/pages/admin/Permissions';
import AuditPage from '@/pages/admin/Audit';
import WorkflowsPage from '@/pages/Workflows';
import SettingsPage from '@/pages/admin/Settings';
import IntegrationsPage from '@/pages/admin/Integrations';
import UserProfile from '@/pages/UserProfile';
import {
  getCurrentUser,
  isSupabaseConfigured,
  type SupabaseUser,
} from '@/lib/supabaseAuth';
import { getLocalCurrentUser, isLocalAuthEnabled } from '@/lib/localAuth';

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreAuth() {
      try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const authPromise = isLocalAuthEnabled()
          ? getLocalCurrentUser()
          : (isSupabaseConfigured() ? getCurrentUser() : Promise.resolve(null));
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        if (mounted) {
          setUser(currentUser ?? null);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    restoreAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center"><Skeleton className="h-8 w-32 bg-slate-800" /></div>;

  const isAuthenticated = Boolean(user);

  return (
    <ErrorBoundary>
      <ToastContainer />
      <SpeedInsights />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login onLogin={async () => setUser(isLocalAuthEnabled() ? await getLocalCurrentUser() : await getCurrentUser())} />}
        />
        <Route path="/admin" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route path="dashboard" element={<PersonalDashboard />} />
          <Route path="workspace" element={<WorkspaceReview />} />
          <Route path="cloud-documents" element={<CloudDocuments />} />
          <Route path="smart-ingest" element={<SmartIngest />} />
          <Route path="activity" element={<CloudAudit />} />
          <Route path="usage" element={<AiUsage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="profile" element={<UserProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/admin/settings" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<SettingsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/login'} replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
