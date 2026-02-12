import { useQuery } from "@tanstack/react-query";
import { authService, type AuthUser } from "../services/authService";

const isAdminUser = (user: AuthUser | null) => {
	if (!user?.role) {
		return false;
	}
	return user.role.toLowerCase() === "admin";
};

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
		isAdmin: isAdminUser(user ?? null)
	};
};
