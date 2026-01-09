import { useQuery } from "@tanstack/react-query";

// Example hook for authentication
export const useAuth = () => {
	const { data: user, isLoading } = useQuery({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			// Replace with actual API call
			return null;
		}
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user
	};
};
