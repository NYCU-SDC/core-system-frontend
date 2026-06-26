import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import type { FormsHighlightPatchRequest, FormsHighlightRequest, FormsHighlightResponse } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useFormHighlight = (formId: string | undefined, enabled = true) =>
	useQuery<FormsHighlightResponse>({
		queryKey: formKeys.highlight(formId ?? ""),
		queryFn: () => api.getFormHighlight(formId!),
		enabled: enabled && !!formId
	});

export const useSetFormHighlight = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsHighlightResponse, Error, FormsHighlightRequest>({
		mutationFn: req => api.setFormHighlight(formId, req),
		onSuccess: data => qc.setQueryData(formKeys.highlight(formId), data)
	});
};

export const useUpdateFormHighlight = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsHighlightResponse, Error, FormsHighlightPatchRequest>({
		mutationFn: req => api.updateFormHighlight(formId, req),
		onSuccess: data => qc.setQueryData(formKeys.highlight(formId), data)
	});
};

export const useClearFormHighlight = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, void>({
		mutationFn: () => api.clearFormHighlight(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.highlight(formId) })
	});
};
