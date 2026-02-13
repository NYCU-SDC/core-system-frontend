import { useQuery } from "@tanstack/react-query";
import { authService, type AuthUser } from "../services/authService";

export const useAuth = () => {
	const { data: user, isLoading } = useQuery<AuthUser | null>({
		queryKey: ["auth", "user"],
		queryFn: authService.getCurrentUser,
		staleTime: 30_000
	});

	return {
		user: user ?? null,
		isLoading,
		isAuthenticated: !!user,
		isOnboarded: user?.is_onboarded ?? false
	};
};
