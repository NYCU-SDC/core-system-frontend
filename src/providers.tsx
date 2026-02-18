import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";

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
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</StrictMode>
	);
}
