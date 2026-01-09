// Authentication service
export const authService = {
	async login(email: string, password: string) {
		// Replace with actual API call
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ email, password })
		});
		return response.json();
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
