import type { UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authLogout, authRefreshToken, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

export type OAuthProvider = "google" | "nycu";

export interface AuthUser extends UserUser {
	isMember?: boolean;
	isFirstLogin?: boolean;
}

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const REFRESH_TOKEN_STORAGE_KEY = "core-system.refresh-token";

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
	getStoredRefreshToken(): string | null {
		if (typeof window === "undefined") return null;
		return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
	},

	setStoredRefreshToken(refreshToken: string) {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
	},

	clearStoredRefreshToken() {
		if (typeof window === "undefined") return;
		window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
	},

	async refreshAccessToken(): Promise<boolean> {
		const refreshToken = this.getStoredRefreshToken();
		if (!refreshToken) return false;

		const res = await authRefreshToken(refreshToken, defaultRequestOptions);
		if (res.status === 404) {
			this.clearStoredRefreshToken();
			throw new Error("Refresh token expired");
		}

		assertOk(res.status, "Failed to refresh access token");
		if (res.data?.refreshToken) {
			this.setStoredRefreshToken(res.data.refreshToken);
		}

		return true;
	},

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
		this.clearStoredRefreshToken();
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
