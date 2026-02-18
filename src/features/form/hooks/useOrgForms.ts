import * as api from "@/features/form/services/api";
import { orgKeys } from "@/shared/queryKeys/org";
import type { FormsForm, FormsFormRequest, FormsFormRequestUpdate } from "@nycu-sdc/core-system-sdk";
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

export const useFormById = (formId: string | undefined, enabled = true) =>
	useQuery({
		queryKey: orgKeys.form(formId || ""),
		queryFn: () => api.getFormById(formId!),
		enabled: enabled && !!formId
	});

export const useUpdateForm = (formId: string) => {
	const qc = useQueryClient();

	return useMutation<FormsForm, Error, FormsFormRequestUpdate>({
		mutationFn: req => api.updateForm(formId, req),
		onSuccess: updatedForm => {
			// 更新單一表單的快取
			qc.setQueryData(orgKeys.form(formId), updatedForm);
			// 也 invalidate 表單列表的快取
			qc.invalidateQueries({ queryKey: orgKeys.forms("sdc") });
		}
	});
};
