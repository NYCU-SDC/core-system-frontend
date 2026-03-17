import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { UserLayout } from "@/layouts";
import { ErrorBoundary, LoadingSpinner } from "@/shared/components";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireLogin from "./RequireLogin";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

/* ── Auth pages ── */
const CallbackPage = lazy(() => import("@/features/auth/components/CallbackPage").then(m => ({ default: m.CallbackPage })));
const HomePage = lazy(() => import("@/features/auth/components/HomePage").then(m => ({ default: m.HomePage })));
const LogoutPage = lazy(() => import("@/features/auth/components/LogoutPage").then(m => ({ default: m.LogoutPage })));
const NotFoundPage = lazy(() => import("@/features/auth/components/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const WelcomePage = lazy(() => import("@/features/auth/components/WelcomePage").then(m => ({ default: m.WelcomePage })));

/* ── User form pages (each a separate chunk) ── */
const FormFilloutPage = lazy(() => import("@/features/form/components/FormFilloutPage").then(m => ({ default: m.FormFilloutPage })));
const FormEntryPage = lazy(() => import("@/features/form/components/FormEntryPage").then(m => ({ default: m.FormEntryPage })));
const FormsListPage = lazy(() => import("@/features/form/components/FormsListPage").then(m => ({ default: m.FormsListPage })));
const OAuthConnectCallbackPage = lazy(() => import("@/features/form/components/OAuthConnectCallbackPage").then(m => ({ default: m.OAuthConnectCallbackPage })));

/* ── Admin pages (each a separate chunk) ── */
const AdminSettingsPage = lazy(() => import("@/features/dashboard/components/AdminSettingsPage").then(m => ({ default: m.AdminSettingsPage })));
const ComponentsDemo = lazy(() => import("@/features/dashboard/components/ComponentsDemo").then(m => ({ default: m.ComponentsDemo })));
const SettingsPage = lazy(() => import("@/features/dashboard/components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AdminFormDetailPage = lazy(() => import("@/features/form/components/AdminFormDetailPage").then(m => ({ default: m.AdminFormDetailPage })));
const AdminFormPreviewPage = lazy(() => import("@/features/form/components/AdminFormPreviewPage").then(m => ({ default: m.AdminFormPreviewPage })));
const AdminFormsPage = lazy(() => import("@/features/form/components/AdminFormsPage").then(m => ({ default: m.AdminFormsPage })));

const DefaultOrgRedirect = () => {
	const { orgSlug } = useParams<{ orgSlug?: string }>();
	const myOrgsQuery = useMyOrgs();
	if (myOrgsQuery.isLoading) return null;
	const slug = orgSlug ?? myOrgsQuery.data?.[0]?.slug ?? "SDC";
	return <Navigate to={`/orgs/${slug}/forms`} replace />;
};

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<ErrorBoundary>
				<Suspense fallback={<LoadingSpinner />}>
					<Routes>
						{/* ── Public routes ── */}
						<Route path="/" element={<HomePage />} />
						<Route path="/callback" element={<CallbackPage />} />
						<Route path="/forms/oauth-callback" element={<OAuthConnectCallbackPage />} />
						<Route path="/welcome" element={<WelcomePage />} />
						<Route path="/logout" element={<LogoutPage />} />

						{/* ── User form routes (login required) ── */}
						<Route element={<RequireLogin />}>
							<Route
								path="/forms"
								element={
									<UserLayout>
										<FormsListPage />
									</UserLayout>
								}
							/>
							<Route
								path="/forms/:formId"
								element={
									<UserLayout>
										<FormEntryPage />
									</UserLayout>
								}
							/>
							<Route
								path="/forms/:formId/:responseId"
								element={
									<UserLayout disablePadding>
										<FormFilloutPage />
									</UserLayout>
								}
							/>
						</Route>

						{/* ── Demo route (public) ── */}
						<Route path="/demo" element={<ComponentsDemo />} />

						{/* ── Organization redirects (org member only) ── */}
						<Route element={<RequireOrgAdminAccess />}>
							<Route path="/orgs/:orgId/*" element={<OrgRewriteToSdc />} />
							<Route path="/orgs" element={<DefaultOrgRedirect />} />
							<Route path="/orgs/:orgSlug" element={<DefaultOrgRedirect />} />
						</Route>

						{/* ── Admin routes (org admin only) ── */}
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

						{/* ── 404 ── */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Suspense>
			</ErrorBoundary>
		</BrowserRouter>
	);
};
