import * as api from "@/features/dashboard/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch forms assigned to the current user
 *
 * @returns React Query result with user's forms, loading state, and error state
 */
export const useMyForms = () =>
	useQuery({
		queryKey: ["forms", "me"],
		queryFn: () => api.listMyForms()
	});
