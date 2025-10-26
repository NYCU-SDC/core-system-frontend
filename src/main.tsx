import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { UnauthorizedError } from "./lib/request/api.ts";
import { triggerAuthError } from "./hooks/useAuthError.ts";

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: error => {
			// Trigger auth error event for 401 in queries
			if (error instanceof UnauthorizedError) {
				console.log("Query 401 error detected, triggering auth error");
				triggerAuthError();
			}
		}
	}),
	mutationCache: new MutationCache({
		onError: error => {
			// Trigger auth error event for 401 in mutations
			if (error instanceof UnauthorizedError) {
				console.log("Mutation 401 error detected, triggering auth error");
				triggerAuthError();
			}
		}
	}),
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// Don't retry on 401 errors
				if (error instanceof UnauthorizedError) {
					return false;
				}
				return failureCount < 3;
			}
		}
	}
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>
);
