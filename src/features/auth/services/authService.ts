import { assertOk } from "@/shared/utils/apiError";
import type { UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authLogout, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

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
		const normalizedProvider = normalizeProvider(provider);
		const params = new URLSearchParams({
			c: options.callbackUrl
		});

		//callback url, get from PUBLIC_ORIGIN, go to /api/auth/login/oauth/:provider/callback, then redirect to redirectUrl or PUBLIC_ORIGIN
		params.set("c", options.callbackUrl);

		if (options.redirectUrl) {
			params.set("r", options.redirectUrl);
		}

		params.set("base", window.location.origin);

		window.location.href = `/api/auth/login/oauth/${normalizedProvider}?${params.toString()}`;
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
