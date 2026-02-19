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
		const refreshAuth = async () => {
			try {
				const refreshed = await authService.refreshAccessToken();
				if (refreshed) {
					queryClient.invalidateQueries({ queryKey: ["user", "me"] });
				}
			} catch {
				queryClient.setQueryData(["user", "me"], null);
			}
		};

		const intervalId = window.setInterval(refreshAuth, 12 * 60 * 1000);
		const onVisibilityChange = () => {
			if (!document.hidden) {
				void refreshAuth();
			}
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			window.clearInterval(intervalId);
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
