import * as api from "@/features/dashboard/services/api";
import type { ResponsesCreateResponse } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

/**
 * Hook to create a form response (start filling a form)
 *
 * @returns Mutation to create form response
 */
export const useCreateFormResponse = () => {
	const qc = useQueryClient();

	return useMutation<ResponsesCreateResponse, Error, string>({
		mutationFn: (formId: string) => api.createFormResponse(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["forms", "me"] })
	});
};
