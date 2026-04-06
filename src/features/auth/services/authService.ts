import { assertOk } from "@/shared/utils/apiError";
import type { AuthLoginGoogleParams, AuthOAuthLoginProviders, UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authAbortLink, authLink, authLogout, getAuthLoginGoogleUrl, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

export type OAuthProvider = "google" | "nycu";

export type AuthUser = UserUser;

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const normalizeProvider = (provider: OAuthProvider): string => {
	return provider.toLowerCase();
};

const ProviderMap: Record<OAuthProvider, AuthOAuthLoginProviders> = {
	google: "google",
	nycu: "portal"
};

export const authService = {
	redirectToOAuthLogin(
		provider: OAuthProvider,
		options: {
			callbackUrl: string;
			redirectUrl?: string;
		}
	) {
		const normalizedProvider = normalizeProvider(provider) as AuthOAuthLoginProviders;

		const params: AuthLoginGoogleParams = {
			c: options.callbackUrl,
			base: window.location.origin
		};

		if (options.redirectUrl) {
			params.r = options.redirectUrl;
		}

		window.location.href = getAuthLoginGoogleUrl(normalizedProvider, params);
	},

	async logout(): Promise<void> {
		const res = await authLogout(defaultRequestOptions);
		assertOk(res.status, "Failed to logout", res.data);
	},

	async getCurrentUser<T extends UserUser = UserUser>(): Promise<T> {
		const res = await userGetMe(defaultRequestOptions);
		assertOk(res.status, "Failed to get current user", res.data);
		return res.data as T;
	},

	async updateOnboarding(data: UserOnboardingRequest): Promise<void> {
		const res = await userUpdateUsername(data, defaultRequestOptions);
		assertOk(res.status, "Failed to update onboarding", res.data);
	},

	async linkOauthAccount(params: { name: string; email: string; oauthProvider: OAuthProvider }): Promise<void> {
		const res = await authLink(
			{
				name: params.name,
				email: params.email,
				oauthProvider: ProviderMap[params.oauthProvider]
			},
			defaultRequestOptions
		);
		assertOk(res.status, "Failed to link OAuth account", res.data);
	},
	async abortLinkOauthAccount(): Promise<void> {
		const res = await authAbortLink(defaultRequestOptions);
		assertOk(res.status, "Failed to abort OAuth account link", res.data);
	}
};
