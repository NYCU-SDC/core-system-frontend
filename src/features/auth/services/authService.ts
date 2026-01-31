import { AuthOAuthProviders } from "@nycu-sdc/core-system-sdk";

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
		// Replace with actual API call
		const response = await fetch("/api/auth/logout", {
			method: "POST"
		});
		return response.json();
	},

	async getCurrentUser() {
		// Replace with actual API call
		const response = await fetch("/api/auth/me");
		return response.json();
	}
};
