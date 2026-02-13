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
			method: "POST",
			credentials: "include"
		});
		return response.json();
	},

	async getCurrentUser() {
		const response = await fetch("/api/users/me", {
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error("Failed to get current user");
		}

		return response.json();
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
