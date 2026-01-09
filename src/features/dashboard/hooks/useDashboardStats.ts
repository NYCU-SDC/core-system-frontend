import { useQuery } from "@tanstack/react-query";

// Example hook for dashboard data
export const useDashboardStats = () => {
	return useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: async () => {
			// Replace with actual API call
			return {
				totalUsers: 1234,
				revenue: 45678,
				activeProjects: 56,
				growth: 23.5
			};
		}
	});
};
