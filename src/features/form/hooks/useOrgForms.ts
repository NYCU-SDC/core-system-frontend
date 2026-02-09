import * as api from "@/features/dashboard/services/api";
import { orgKeys } from "@/shared/queryKeys/org";
import type { FormsForm, FormsFormRequest } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch all forms for an organization
 *
 * @param slug - Organization slug (e.g., "SDC")
 * @returns React Query result with forms data, loading state, and error state
 */
export const useOrgForms = (slug: string) =>
	useQuery({
		queryKey: orgKeys.forms(slug),
		queryFn: () => api.listOrgForms(slug)
	});

/**
 * Hook to create a new form under an organization
 *
 * @param slug - Organization slug (e.g., "SDC")
 * @returns Mutation with mutate function and status
 */
export const useCreateOrgForm = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<FormsForm, Error, FormsFormRequest>({
		mutationFn: req => api.createOrgForm(slug, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.forms(slug) })
	});
};
