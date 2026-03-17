import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { UserLayout } from "@/layouts";
import { ErrorBoundary, LoadingSpinner } from "@/shared/components";
import type { ComponentType } from "react";
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useParams } from "react-router-dom";
import OrgRewriteToSdc from "./OrgRewriteToSdc";
import RequireLogin from "./RequireLogin";
import RequireOrgAdminAccess from "./RequireOrgAdminAccess";

const DefaultOrgRedirect = () => {
	const { orgSlug } = useParams<{ orgSlug?: string }>();
	const myOrgsQuery = useMyOrgs();

	if (myOrgsQuery.isLoading) {
		return <LoadingSpinner />;
	}

	const slug = orgSlug ?? myOrgsQuery.data?.[0]?.slug ?? "SDC";
	return <Navigate to={`/orgs/${slug}/forms`} replace />;
};

function lazyPage<TModule extends Record<string, unknown>>(importer: () => Promise<TModule>, key: keyof TModule) {
	return async () => {
		const mod = await importer();
		return {
			Component: mod[key] as ComponentType
		};
	};
}

/* ── Public pages ── */
const homeRoute = lazyPage(() => import("@/features/auth/components/HomePage"), "HomePage");
const callbackRoute = lazyPage(() => import("@/features/auth/components/CallbackPage"), "CallbackPage");
const logoutRoute = lazyPage(() => import("@/features/auth/components/LogoutPage"), "LogoutPage");
const welcomeRoute = lazyPage(() => import("@/features/auth/components/WelcomePage"), "WelcomePage");
const notFoundRoute = lazyPage(() => import("@/features/auth/components/NotFoundPage"), "NotFoundPage");
const demoRoute = lazyPage(() => import("@/features/dashboard/components/ComponentsDemo"), "ComponentsDemo");

/* ── User pages ── */
const formsListRoute = lazyPage(() => import("@/features/form/components/FormsListPage"), "FormsListPage");
const formEntryRoute = lazyPage(() => import("@/features/form/components/FormEntryPage"), "FormEntryPage");
const formFilloutRoute = lazyPage(() => import("@/features/form/components/FormFilloutPage"), "FormFilloutPage");
const oauthConnectCallbackRoute = lazyPage(() => import("@/features/form/components/OAuthConnectCallbackPage"), "OAuthConnectCallbackPage");

/* ── Admin pages ── */
const adminFormsRoute = lazyPage(() => import("@/features/form/components/AdminFormsPage"), "AdminFormsPage");
const adminFormDetailRoute = lazyPage(() => import("@/features/form/components/AdminFormDetailPage"), "AdminFormDetailPage");
const adminFormPreviewRoute = lazyPage(() => import("@/features/form/components/AdminFormPreviewPage"), "AdminFormPreviewPage");
const adminSettingsRoute = lazyPage(() => import("@/features/dashboard/components/AdminSettingsPage"), "AdminSettingsPage");
const settingsRoute = lazyPage(() => import("@/features/dashboard/components/SettingsPage"), "SettingsPage");

const router = createBrowserRouter([
	{
		/* Root layout: provides a loading spinner while lazy chunks load on initial page visit */
		element: <Outlet />,
		hydrateFallbackElement: <LoadingSpinner />,
		children: [
			/* ── Public routes ── */
			{
				path: "/",
				lazy: homeRoute
			},
			{
				path: "/callback",
				lazy: callbackRoute
			},
			{
				path: "/forms/oauth-callback",
				lazy: oauthConnectCallbackRoute
			},
			{
				path: "/welcome",
				lazy: welcomeRoute
			},
			{
				path: "/logout",
				lazy: logoutRoute
			},
			{
				path: "/demo",
				lazy: demoRoute
			},

			/* ── User form routes (login required) ── */
			{
				element: <RequireLogin />,
				children: [
					{
						element: <UserLayout />,
						children: [
							{
								path: "/forms",
								lazy: formsListRoute
							},
							{
								path: "/forms/:formId",
								lazy: formEntryRoute
							}
						]
					},
					{
						element: <UserLayout disablePadding />,
						children: [
							{
								path: "/forms/:formId/:responseId",
								lazy: formFilloutRoute
							}
						]
					}
				]
			},

			/* ── Organization redirects + Admin routes ── */
			{
				element: <RequireOrgAdminAccess />,
				children: [
					{
						path: "/orgs/:orgId/*",
						Component: OrgRewriteToSdc
					},
					{
						path: "/orgs",
						Component: DefaultOrgRedirect
					},
					{
						path: "/orgs/:orgSlug",
						Component: DefaultOrgRedirect
					},

					{
						path: "/orgs/:orgSlug/forms",
						lazy: adminFormsRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/info",
						lazy: adminFormDetailRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/edit",
						lazy: adminFormDetailRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/section/:sectionId/edit",
						lazy: adminFormDetailRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/reply",
						lazy: adminFormDetailRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/design",
						lazy: adminFormDetailRoute
					},
					{
						path: "/orgs/:orgSlug/forms/:formid/preview",
						lazy: adminFormPreviewRoute
					},
					{
						path: "/orgs/:orgSlug/settings",
						lazy: adminSettingsRoute
					},
					{
						path: "/account/settings",
						lazy: settingsRoute
					}
				]
			},

			/* ── 404 ── */
			{
				path: "*",
				lazy: notFoundRoute
			}
		]
	}
]);

export const AppRouter = () => {
	return (
		<ErrorBoundary>
			<RouterProvider router={router} />
		</ErrorBoundary>
	);
};
