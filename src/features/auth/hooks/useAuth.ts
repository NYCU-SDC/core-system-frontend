import { authService } from "@/features/auth/services/authService";
import type { UserOnboardingRequest } from "@nycu-sdc/core-system-sdk";
import { authRefreshToken } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const DEFAULT_AUTH_REFRESH_INTERVAL = 5 * 60 * 1000;

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

export const useAuthRefreshInterval = () => {
	useEffect(() => {
		console.log("Setting up auth refresh interval");
		const interval = setInterval(() => {
			console.log("Refreshing auth token");
			authRefreshToken("");
		}, DEFAULT_AUTH_REFRESH_INTERVAL);

		return () => clearInterval(interval);
	}, []);
};
