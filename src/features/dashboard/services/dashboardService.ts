// Dashboard service
export const dashboardService = {
	async getStats() {
		// Replace with actual API call
		const response = await fetch("/api/dashboard/stats");
		return response.json();
	},

	async getRecentActivity() {
		// Replace with actual API call
		const response = await fetch("/api/dashboard/activity");
		return response.json();
	}
};
