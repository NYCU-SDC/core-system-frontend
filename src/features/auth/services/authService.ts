import type { UserUser } from "@nycu-sdc/core-system-sdk";
import { AuthOAuthProviders, authLogout, userGetMe } from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const assertOk = (status: number, message: string) => {
	if (status < 200 || status >= 300) {
		throw new Error(`${message} (status ${status})`);
	}
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

	async getCurrentUser(): Promise<UserUser> {
		const res = await userGetMe(defaultRequestOptions);
		assertOk(res.status, "Failed to get current user");
		return res.data as UserUser;
	}
};
