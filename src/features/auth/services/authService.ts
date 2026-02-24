import { assertOk } from "@/shared/utils/apiError";
import type { UserOnboardingRequest, UserUser } from "@nycu-sdc/core-system-sdk";
import { authLogout, authRefreshToken, userGetMe, userUpdateUsername } from "@nycu-sdc/core-system-sdk";

export type OAuthProvider = "google" | "nycu";

export type AuthUser = UserUser;

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const REFRESH_TOKEN_STORAGE_KEY = "core-system.refresh-token";
const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = "core-system.access-token-exp-ms";
let refreshInFlight: Promise<boolean> | null = null;

const parseJwtExpirationMs = (jwt: string): number | null => {
	try {
		const [, payloadBase64Url] = jwt.split(".");
		if (!payloadBase64Url) return null;
		const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
		const padded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
		const payloadJson = atob(padded);
		const payload = JSON.parse(payloadJson) as { exp?: number };
		if (!payload.exp || typeof payload.exp !== "number") return null;
		return payload.exp * 1000;
	} catch {
		return null;
	}
};

export const withAuthRefreshRetry = async <T extends { status: number }>(request: () => Promise<T>): Promise<T> => {
	const firstResponse = await request();
	if (firstResponse.status !== 401) return firstResponse;

	if (!refreshInFlight) {
		refreshInFlight = authService
			.refreshAccessToken()
			.catch(() => false)
			.finally(() => {
				refreshInFlight = null;
			});
	}

	const refreshed = await refreshInFlight;
	if (!refreshed) return firstResponse;

	return request();
};

const normalizeProvider = (provider: OAuthProvider): string => {
	return provider.toLowerCase();
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

	getStoredAccessTokenExpiryMs(): number | null {
		if (typeof window === "undefined") return null;
		const raw = window.localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
		if (!raw) return null;
		const value = Number(raw);
		return Number.isFinite(value) ? value : null;
	},

	setStoredAccessTokenExpiryMs(expirationMs: number) {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY, String(expirationMs));
	},

	clearStoredAccessTokenExpiryMs() {
		if (typeof window === "undefined") return;
		window.localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
	},

	clearStoredRefreshToken() {
		if (typeof window === "undefined") return;
		window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
		this.clearStoredAccessTokenExpiryMs();
	},

	async refreshAccessToken(): Promise<boolean> {
		const refreshToken = this.getStoredRefreshToken();
		if (!refreshToken) return false;

		const res = await authRefreshToken(refreshToken, defaultRequestOptions);
		if (res.status === 404) {
			this.clearStoredRefreshToken();
			throw new Error("Refresh token expired");
		}

		assertOk(res.status, "Failed to refresh access token", res.data);
		if (res.data?.refreshToken) {
			this.setStoredRefreshToken(res.data.refreshToken);
		}
		const accessTokenExpMs = parseJwtExpirationMs(res.data.accessToken);
		if (accessTokenExpMs) {
			this.setStoredAccessTokenExpiryMs(accessTokenExpMs);
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

		//callback url, get from PUBLIC_ORIGIN, go to /api/auth/login/oauth/:provider/callback, then redirect to redirectUrl or PUBLIC_ORIGIN
		params.set("c", options.callbackUrl);

		if (options.redirectUrl) {
			params.set("r", options.redirectUrl);
		}

		window.location.href = `/api/auth/login/oauth/${normalizedProvider}?${params.toString()}`;
	},

	async logout(): Promise<void> {
		const res = await withAuthRefreshRetry(() => authLogout(defaultRequestOptions));
		assertOk(res.status, "Failed to logout", res.data);
		this.clearStoredRefreshToken();
	},

	async getCurrentUser<T extends UserUser = UserUser>(): Promise<T> {
		const res = await withAuthRefreshRetry(() => userGetMe(defaultRequestOptions));
		assertOk(res.status, "Failed to get current user", res.data);
		return res.data as T;
	},

	async updateOnboarding(data: UserOnboardingRequest): Promise<void> {
		const res = await withAuthRefreshRetry(() => userUpdateUsername(data, defaultRequestOptions));
		assertOk(res.status, "Failed to update onboarding", res.data);
	}
};
