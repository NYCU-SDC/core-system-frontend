import { NotFoundPage } from "@/features/auth/components/NotFoundPage";
import { AdminSettingsPage } from "@/features/dashboard/components/AdminSettingsPage";
import { ComponentsDemo } from "@/features/dashboard/components/ComponentsDemo";
import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminFormDetailPage, AdminFormsPage } from "@/features/form/components";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

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
					<Route path="/orgs/:orgSlug/settings" element={<AdminSettingsPage />} />
				</Route>

				{/* 404 */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
};
