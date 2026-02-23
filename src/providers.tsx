import { authService } from "@/features/auth/services/authService";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1
		}
	}
});

const AuthRefreshManager = () => {
	useEffect(() => {
		const REFRESH_LEAD_MS = 60 * 1000;
		const MIN_SCHEDULE_MS = 30 * 1000;
		let timerId: number | null = null;
		let refreshingPromise: Promise<void> | null = null;
		let stopped = false;

		const clearTimer = () => {
			if (timerId !== null) {
				window.clearTimeout(timerId);
				timerId = null;
			}
		};

		const scheduleNextRefresh = () => {
			clearTimer();
			if (stopped || !authService.getStoredRefreshToken()) return;

			const expirationMs = authService.getStoredAccessTokenExpiryMs();
			const delay = expirationMs ? Math.max(expirationMs - Date.now() - REFRESH_LEAD_MS, MIN_SCHEDULE_MS) : MIN_SCHEDULE_MS;
			timerId = window.setTimeout(() => {
				void refreshAuth();
			}, delay);
		};

		const refreshAuth = async () => {
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
					scheduleNextRefresh();
				}
			})();

			await refreshingPromise;
		};

		const shouldRefreshSoon = () => {
			const expirationMs = authService.getStoredAccessTokenExpiryMs();
			if (!expirationMs) return true;
			return expirationMs - Date.now() <= REFRESH_LEAD_MS;
		};

		if (authService.getStoredRefreshToken()) {
			if (shouldRefreshSoon()) {
				void refreshAuth();
			} else {
				scheduleNextRefresh();
			}
		}

		const onVisibilityChange = () => {
			if (document.hidden) return;
			if (!authService.getStoredRefreshToken()) return;
			if (shouldRefreshSoon()) {
				void refreshAuth();
				return;
			}
			scheduleNextRefresh();
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			stopped = true;
			clearTimer();
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	return null;
};

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<StrictMode>
			<HelmetProvider>
				<QueryClientProvider client={queryClient}>
					<AuthRefreshManager />
					{children}
				</QueryClientProvider>
			</HelmetProvider>
		</StrictMode>
	);
}
