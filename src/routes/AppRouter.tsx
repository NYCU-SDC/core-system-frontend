import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../features/auth/components/HomePage';
import { CallbackPage } from '../features/auth/components/CallbackPage';
import { WelcomePage } from '../features/auth/components/WelcomePage';
import { LogoutPage } from '../features/auth/components/LogoutPage';
import { NotFoundPage } from '../features/auth/components/NotFoundPage';
import { FormsListPage } from '../features/dashboard/components/FormsListPage';
import { FormDetailPage } from '../features/dashboard/components/FormDetailPage';
import { AdminFormsPage } from '../features/dashboard/components/AdminFormsPage';
import { AdminFormDetailPage } from '../features/dashboard/components/AdminFormDetailPage';
import { AdminSettingsPage } from '../features/dashboard/components/AdminSettingsPage';
import { ComponentsDemo } from '../features/dashboard/components/ComponentsDemo';
import OrgRewriteToSdc from './OrgRewriteToSdc';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/logout" element={<LogoutPage />} />

        {/* Demo route */}
        <Route path="/demo" element={<ComponentsDemo />} />

        {/* User routes */}
        <Route path="/forms" element={<FormsListPage />} />
        <Route path="/forms/:id" element={<FormDetailPage />} />

        {/* Organization redirects */}
        <Route path="/orgs/:orgId/*" element={<OrgRewriteToSdc />} />
        <Route path="/orgs" element={<Navigate to="/orgs/sdc/forms" replace />} />
        <Route path="/orgs/sdc" element={<Navigate to="/orgs/sdc/forms" replace />} />

        {/* Admin routes */}
        <Route path="/orgs/sdc/forms" element={<AdminFormsPage />} />
        <Route path="/orgs/sdc/forms/:formid/info" element={<AdminFormDetailPage />} />
        <Route path="/orgs/sdc/forms/:formid/edit" element={<AdminFormDetailPage />} />
        <Route path="/orgs/sdc/forms/:formid/reply" element={<AdminFormDetailPage />} />
        <Route path="/orgs/sdc/forms/:formid/design" element={<AdminFormDetailPage />} />
        <Route path="/orgs/sdc/settings" element={<AdminSettingsPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
