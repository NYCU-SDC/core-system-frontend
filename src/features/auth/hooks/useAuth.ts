import { authService } from "@/features/auth/services/authService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useMe = () =>
	useQuery({
		queryKey: ["user", "me"],
		queryFn: () => authService.getCurrentUser()
	});

export const useLogout = () =>
	useMutation({
		mutationFn: () => authService.logout()
	});

export const useAuth = () => {
	const { data: user, isLoading } = useMe();

	return {
		user,
		isAuthenticated: !!user,
		isLoading
	};
};
