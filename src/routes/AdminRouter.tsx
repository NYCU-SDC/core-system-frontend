import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { ErrorBoundary, LoadingSpinner } from "@/shared/components";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { CrossEntryCurrentRedirect } from "./CrossEntryRedirect";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

const NotFoundPage = lazy(() => import("@/features/auth/components/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const AdminSettingsPage = lazy(() => import("@/features/dashboard/components/AdminSettingsPage").then(m => ({ default: m.AdminSettingsPage })));
const ComponentsDemo = lazy(() => import("@/features/dashboard/components/ComponentsDemo").then(m => ({ default: m.ComponentsDemo })));
const SettingsPage = lazy(() => import("@/features/dashboard/components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AdminFormDetailPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.AdminFormDetailPage })));
const AdminFormPreviewPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.AdminFormPreviewPage })));
const AdminFormsPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.AdminFormsPage })));

const DefaultOrgRedirect = () => {
	const { orgSlug } = useParams<{ orgSlug?: string }>();
	const myOrgsQuery = useMyOrgs();
	if (myOrgsQuery.isLoading) return null;
	const slug = orgSlug ?? myOrgsQuery.data?.[0]?.slug ?? "SDC";
	return <Navigate to={`/orgs/${slug}/forms`} replace />;
};

export const AdminRouter = () => {
	return (
		<BrowserRouter>
			<ErrorBoundary>
				<Suspense fallback={<LoadingSpinner />}>
					<Routes>
						{/* Demo route */}
						<Route path="/demo" element={<ComponentsDemo />} />

						{/* Organization redirects (org member only) */}
						<Route element={<RequireOrgAdminAccess />}>
							<Route path="/orgs/:orgId/*" element={<OrgRewriteToSdc />} />
							<Route path="/orgs" element={<DefaultOrgRedirect />} />
							<Route path="/orgs/:orgSlug" element={<DefaultOrgRedirect />} />
						</Route>

						{/* Admin routes (org admin only) */}
						<Route element={<RequireOrgAdminAccess />}>
							<Route path="/orgs/:orgSlug/forms" element={<AdminFormsPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/info" element={<AdminFormDetailPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/edit" element={<AdminFormDetailPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/section/:sectionId/edit" element={<AdminFormDetailPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/reply" element={<AdminFormDetailPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/design" element={<AdminFormDetailPage />} />
							<Route path="/orgs/:orgSlug/forms/:formid/preview" element={<AdminFormPreviewPage />} />
							<Route path="/orgs/:orgSlug/settings" element={<AdminSettingsPage />} />
							<Route path="/account/settings" element={<SettingsPage />} />
						</Route>

						{/* Cross-entry: force a hard navigation so the server can serve forms.html */}
						<Route path="/" element={<CrossEntryCurrentRedirect />} />
						<Route path="/callback" element={<CrossEntryCurrentRedirect />} />
						<Route path="/welcome" element={<CrossEntryCurrentRedirect />} />
						<Route path="/logout" element={<CrossEntryCurrentRedirect />} />
						<Route path="/forms" element={<CrossEntryCurrentRedirect />} />
						<Route path="/forms/*" element={<CrossEntryCurrentRedirect />} />

						{/* 404 */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Suspense>
			</ErrorBoundary>
		</BrowserRouter>
	);
};
