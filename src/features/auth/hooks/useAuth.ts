import { authService } from "@/features/auth/services/authService";
import { userKeys } from "@/shared/queryKeys/org";
import type { UserOnboardingRequest } from "@nycu-sdc/core-system-sdk";
import { authRefreshToken } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const DEFAULT_AUTH_REFRESH_INTERVAL = 10 * 1000;

export const useMe = () =>
	useQuery({
		queryKey: userKeys.me,
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
		onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me })
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

export const useAuthRefreshInterval = () => {
	useEffect(() => {
		const interval = setInterval(() => {
			authRefreshToken();
		}, DEFAULT_AUTH_REFRESH_INTERVAL);

		return () => clearInterval(interval);
	}, []);
};
