import type { UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authLogout, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

export type OAuthProvider = "google" | "nycu";

export interface AuthUser extends UserUser {
	isMember?: boolean;
	isFirstLogin?: boolean;
}

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const assertOk = (status: number, message: string) => {
	if (status < 200 || status >= 300) {
		throw new Error(`${message} (status ${status})`);
	}
};

const normalizeProvider = (provider: OAuthProvider): string => {
	return provider.toLowerCase();
};

export const canAccessWelcome = (user: AuthUser): boolean => {
	const hasGuardFlags = typeof user.isMember === "boolean" && typeof user.isFirstLogin === "boolean";
	if (hasGuardFlags) {
		return user.isMember === true && user.isFirstLogin === true;
	}
	return true; // If flags are not set, allow access
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

		if (options.redirectUrl) {
			params.set("r", options.redirectUrl);
		}

		window.location.href = `/api/auth/login/oauth/${normalizedProvider}?${params.toString()}`;
	},

	async logout(): Promise<void> {
		const res = await authLogout(defaultRequestOptions);
		assertOk(res.status, "Failed to logout");
	},

	async getCurrentUser<T extends UserUser = UserUser>(): Promise<T> {
		const res = await userGetMe(defaultRequestOptions);
		assertOk(res.status, "Failed to get current user");
		return res.data as T;
	},

	async updateOnboarding(data: UserOnboardingRequest): Promise<void> {
		const res = await userUpdateUsername(data, defaultRequestOptions);
		assertOk(res.status, "Failed to update onboarding");
	}
};
