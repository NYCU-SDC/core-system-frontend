import * as api from "@/features/form/services/api";
import { orgKeys } from "@/shared/queryKeys/org";
import type { FormsForm, FormsFormRequest } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrgForms = (slug: string) =>
	useQuery({
		queryKey: orgKeys.forms(slug),
		queryFn: () => api.listOrgForms(slug)
	});

export const useCreateOrgForm = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<FormsForm, Error, FormsFormRequest>({
		mutationFn: req => api.createOrgForm(slug, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.forms(slug) })
	});
};
