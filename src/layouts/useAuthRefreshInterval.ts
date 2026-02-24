import { authService } from "@/features/auth/services/authService";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

export const useAuthRefreshInterval = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		let refreshingPromise: Promise<void> | null = null;

		const refreshAuth = async () => {
			if (!authService.getStoredRefreshToken()) return;
			if (refreshingPromise) {
				await refreshingPromise;
				return;
			}

			refreshingPromise = (async () => {
				try {
					const refreshed = await authService.refreshAccessToken();
					if (refreshed) {
						queryClient.invalidateQueries({ queryKey: ["user", "me"] });
					}
				} catch {
					queryClient.setQueryData(["user", "me"], null);
				} finally {
					refreshingPromise = null;
				}
			})();

			await refreshingPromise;
		};

		const intervalId = window.setInterval(() => {
			void refreshAuth();
		}, REFRESH_INTERVAL_MS);

		void refreshAuth();

		return () => {
			window.clearInterval(intervalId);
		};
	}, [queryClient]);
};
