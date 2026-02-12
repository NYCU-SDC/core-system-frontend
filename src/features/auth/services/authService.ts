import { UserRole } from "@nycu-sdc/core-system-sdk";

// TODO: Align with backend user response contract if fields change.
export type AuthUser = {
	id?: string;
	username?: string;
	name?: string;
	avatarUrl?: string;
	// NOTE: SDK currently only exposes USER; ADMIN may be added later.
	role?: UserRole | "ADMIN";
	emails?: string[];
	is_onboarded?: boolean;
};

export type OAuthProvider = "google" | "nycu";

const normalizeProvider = (provider: OAuthProvider) => String(provider).toLowerCase();

async function readJsonSafely<T>(response: Response): Promise<T | null> {
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		return null;
	}
	return (await response.json()) as T;
}

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

	async logout() {
		const response = await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "include"
		});

		if (!response.ok) {
			throw new Error(`Logout failed (${response.status})`);
		}

		return readJsonSafely<unknown>(response);
	},

	async getCurrentUser<TUser extends AuthUser = AuthUser>(): Promise<TUser | null> {
		const response = await fetch("/api/users/me", {
			credentials: "include"
		});

		if (response.status === 401 || response.status === 403) {
			return null;
		}
		if (!response.ok) {
			throw new Error(`Get current user failed (${response.status})`);
		}

		return readJsonSafely<TUser>(response);
	}
};
