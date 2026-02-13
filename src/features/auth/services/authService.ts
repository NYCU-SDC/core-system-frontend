// TODO: Align with backend user response contract if fields change.
export type AuthUser = {
	id?: string;
	username?: string;
	name?: string;
	avatarUrl?: string;
	emails?: string[];
	roles?: Array<"USER">;
	is_onboarded?: boolean;
	allow_onboarding?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const canAccessWelcome = (user: unknown): boolean => {
	if (!isRecord(user)) return false;

	const isFirstLogin = user.is_onboarded === false;
	const hasAllowFlag = typeof user.allow_onboarding === "boolean";
	const isOnboardingAllowed = user.allow_onboarding === true;

	// TODO: Remove fallback once backend always returns allow_onboarding.
	return hasAllowFlag ? isFirstLogin && isOnboardingAllowed : isFirstLogin;
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
  },

	async updateOnboarding(payload: { username: string; name: string }) {
		const response = await fetch("/api/users/onboarding", {
			method: "PUT",
			credentials: "include",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error("Failed to update onboarding");
		}

		const contentType = response.headers.get("content-type") ?? "";
		if (!contentType.includes("application/json")) {
			return null;
		}

		return response.json();
	}
};
