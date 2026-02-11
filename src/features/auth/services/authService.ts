import { AuthOAuthProviders } from "@nycu-sdc/core-system-sdk";

async function readJsonSafely<T>(response: Response): Promise<T | null> {
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		return null;
	}
	return (await response.json()) as T;
}

export const authService = {
	redirectToOAuthLogin(
		provider: AuthOAuthProviders,
		options: {
			callbackUrl: string;
			redirectUrl?: string;
		}
	) {
		const params = new URLSearchParams({
			c: options.callbackUrl
		});

		if (options.redirectUrl) {
			params.set("r", options.redirectUrl);
		}

		window.location.href = `/api/auth/login/oauth/${provider}?${params.toString()}`;
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

	async getCurrentUser<TUser = unknown>(): Promise<TUser | null> {
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
