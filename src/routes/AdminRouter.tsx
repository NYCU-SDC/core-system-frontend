import { NotFoundPage } from "@/features/auth/components/NotFoundPage";
import { AdminSettingsPage } from "@/features/dashboard/components/AdminSettingsPage";
import { ComponentsDemo } from "@/features/dashboard/components/ComponentsDemo";
import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminFormDetailPage, AdminFormsPage } from "@/features/form/components";
import { AdminLayout } from "@/layouts";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

const DefaultOrgRedirect = () => {
	const myOrgsQuery = useMyOrgs();
	if (myOrgsQuery.isLoading) return null;
	const slug = myOrgsQuery.data?.[0]?.slug ?? "sdc";
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
					<Route
						path="/orgs/:orgSlug/forms"
						element={
							<AdminLayout>
								<AdminFormsPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/forms/:formid/info"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/forms/:formid/edit"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/forms/:formid/section/:sectionId/edit"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/forms/:formid/reply"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/forms/:formid/design"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/:orgSlug/settings"
						element={
							<AdminLayout>
								<AdminSettingsPage />
							</AdminLayout>
						}
					/>
				</Route>

				{/* 404 */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
};
