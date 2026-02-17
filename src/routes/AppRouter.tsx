import { CallbackPage } from "@/features/auth/components/CallbackPage";
import { HomePage } from "@/features/auth/components/HomePage";
import { LogoutPage } from "@/features/auth/components/LogoutPage";
import { NotFoundPage } from "@/features/auth/components/NotFoundPage";
import { WelcomePage } from "@/features/auth/components/WelcomePage";
import { AdminSettingsPage } from "@/features/dashboard/components/AdminSettingsPage";
import { ComponentsDemo } from "@/features/dashboard/components/ComponentsDemo";
import { AdminFormDetailPage, AdminFormsPage, FormDetailPage, FormsListPage } from "@/features/form/components";
import { SmartLayout } from "@/layouts";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

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

				<Route
					path="/forms"
					element={
						<SmartLayout>
							<FormsListPage />
						</SmartLayout>
					}
				/>
				<Route
					path="/forms/:id"
					element={
						<SmartLayout>
							<FormDetailPage />
						</SmartLayout>
					}
				/>

				{/* Organization redirects (org member only) */}
				<Route element={<RequireOrgAdminAccess />}>
					<Route path="/orgs/:orgId/*" element={<OrgRewriteToSdc />} />
					<Route path="/orgs" element={<Navigate to="/orgs/sdc/forms" replace />} />
					<Route path="/orgs/sdc" element={<Navigate to="/orgs/sdc/forms" replace />} />
				</Route>

				{/* Admin routes */}
				<Route element={<RequireOrgAdminAccess />}>
					<Route path="/orgs/sdc/forms" element={<AdminFormsPage />} />
					<Route path="/orgs/sdc/forms/:formid/info" element={<AdminFormDetailPage />} />
					<Route path="/orgs/sdc/forms/:formid/edit" element={<AdminFormDetailPage />} />
					<Route path="/orgs/sdc/forms/:formid/section/:sectionId/edit" element={<AdminFormDetailPage />} />
					<Route path="/orgs/sdc/forms/:formid/reply" element={<AdminFormDetailPage />} />
					<Route path="/orgs/sdc/forms/:formid/design" element={<AdminFormDetailPage />} />
					<Route path="/orgs/sdc/settings" element={<AdminSettingsPage />} />
				</Route>

				{/* 404 */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
};
