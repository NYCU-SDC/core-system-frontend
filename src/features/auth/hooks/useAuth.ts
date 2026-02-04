import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const useAuth = () => {
	const { data: user, isLoading } = useQuery({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			return authService.getCurrentUser();
		},
		staleTime: 30_000
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user
	};
};
