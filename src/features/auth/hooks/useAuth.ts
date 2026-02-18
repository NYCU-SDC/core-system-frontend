import { authService } from "@/features/auth/services/authService";
import type { UserOnboardingRequest } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMe = () =>
	useQuery({
		queryKey: ["user", "me"],
		queryFn: () => authService.getCurrentUser()
	});

export const useLogout = () =>
	useMutation({
		mutationFn: () => authService.logout()
	});

export const useUpdateOnboarding = () => {
	const qc = useQueryClient();
	return useMutation<void, Error, UserOnboardingRequest>({
		mutationFn: data => authService.updateOnboarding(data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "me"] })
	});
};

export const useAuth = () => {
	const { data: user, isLoading } = useMe();

	return {
		user,
		isAuthenticated: !!user,
		isLoading
	};
};
