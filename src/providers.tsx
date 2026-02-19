import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1
		}
	}
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<StrictMode>
			<HelmetProvider>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</HelmetProvider>
		</StrictMode>
	);
}
