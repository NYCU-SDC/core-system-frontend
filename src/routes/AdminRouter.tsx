import { NotFoundPage } from "@/features/auth/components/NotFoundPage";
import { AdminSettingsPage } from "@/features/dashboard/components/AdminSettingsPage";
import { ComponentsDemo } from "@/features/dashboard/components/ComponentsDemo";
import { AdminFormDetailPage, AdminFormsPage } from "@/features/form/components";
import { AdminLayout } from "@/layouts";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

export const AdminRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/* Demo route */}
				<Route path="/demo" element={<ComponentsDemo />} />

				{/* Organization redirects (org member only) */}
				<Route element={<RequireOrgAdminAccess />}>
					<Route path="/orgs/:orgId/*" element={<OrgRewriteToSdc />} />
					<Route path="/orgs" element={<Navigate to="/orgs/sdc/forms" replace />} />
					<Route path="/orgs/sdc" element={<Navigate to="/orgs/sdc/forms" replace />} />
				</Route>

				{/* Admin routes (org admin only) */}
				<Route element={<RequireOrgAdminAccess />}>
					<Route
						path="/orgs/sdc/forms"
						element={
							<AdminLayout>
								<AdminFormsPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/forms/:formid/info"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/forms/:formid/edit"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/forms/:formid/section/:sectionId/edit"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/forms/:formid/reply"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/forms/:formid/design"
						element={
							<AdminLayout>
								<AdminFormDetailPage />
							</AdminLayout>
						}
					/>
					<Route
						path="/orgs/sdc/settings"
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
