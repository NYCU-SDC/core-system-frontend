import { UserLayout } from "@/layouts";
import { ErrorBoundary, LoadingSpinner } from "@/shared/components";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CrossEntryCurrentRedirect } from "./CrossEntryRedirect";
import RequireLogin from "./RequireLogin";

const CallbackPage = lazy(() => import("@/features/auth/components/CallbackPage").then(m => ({ default: m.CallbackPage })));
const HomePage = lazy(() => import("@/features/auth/components/HomePage").then(m => ({ default: m.HomePage })));
const LogoutPage = lazy(() => import("@/features/auth/components/LogoutPage").then(m => ({ default: m.LogoutPage })));
const NotFoundPage = lazy(() => import("@/features/auth/components/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const WelcomePage = lazy(() => import("@/features/auth/components/WelcomePage").then(m => ({ default: m.WelcomePage })));
const FormFilloutPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.FormFilloutPage })));
const FormEntryPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.FormEntryPage })));
const FormsListPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.FormsListPage })));
const OAuthConnectCallbackPage = lazy(() => import("@/features/form/components").then(m => ({ default: m.OAuthConnectCallbackPage })));
const OauthLinkPage = lazy(() => import("@/features/auth/components/OauthLinkPage").then(m => ({ default: m.OauthLinkPage })));

export const UserRouter = () => {
	return (
		<BrowserRouter>
			<ErrorBoundary>
				<Suspense fallback={<LoadingSpinner />}>
					<Routes>
						{/* Public routes */}
						<Route path="/" element={<HomePage />} />
						<Route path="/callback" element={<CallbackPage />} />
						<Route path="/forms/oauth-callback" element={<OAuthConnectCallbackPage />} />
						<Route path="/welcome" element={<WelcomePage />} />
						<Route path="/link" element={<OauthLinkPage />} />
						<Route path="/logout" element={<LogoutPage />} />
						{/* User form routes */}
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
						{/* Cross-entry: force a hard navigation so the server can serve admin.html */}
						<Route path="/demo" element={<CrossEntryCurrentRedirect />} />
						<Route path="/orgs" element={<CrossEntryCurrentRedirect />} />
						<Route path="/orgs/*" element={<CrossEntryCurrentRedirect />} />
						{/* 404 */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Suspense>
			</ErrorBoundary>
		</BrowserRouter>
	);
};
