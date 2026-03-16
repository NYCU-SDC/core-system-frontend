import { assertOk } from "@/shared/utils/apiError";
import type { AuthLoginGoogleParams, AuthOAuthLoginProviders, UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authLogout, getAuthLoginGoogleUrl, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

export type OAuthProvider = "google" | "nycu";

export type AuthUser = UserUser;

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const normalizeProvider = (provider: OAuthProvider): string => {
	return provider.toLowerCase();
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
			c: options.callbackUrl
		};

		if (options.redirectUrl) {
			params.r = options.redirectUrl;
		}

		let url = getAuthLoginGoogleUrl(normalizedProvider, params);
		const base = window.location.origin;
		const separator = url.includes("?") ? "&" : "?";
		url = `${url}${separator}base=${encodeURIComponent(base)}`;

		window.location.href = url;
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
	}
};
