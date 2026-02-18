import * as api from "@/features/form/services/api";
import { formKeys, orgKeys } from "@/shared/queryKeys/org";
import type {
	FormsFont,
	FormsForm,
	FormsFormCoverUploadResponse,
	FormsFormRequest,
	FormsFormRequestUpdate,
	FormsGoogleSheetEmailResponse,
	FormsGoogleSheetVerifyRequest,
	FormsGoogleSheetVerifyResponse
} from "@nycu-sdc/core-system-sdk";
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
			qc.setQueryData(orgKeys.form(formId), updatedForm);
			qc.invalidateQueries({ queryKey: orgKeys.forms("sdc") });
		}
	});
};

export const usePublishForm = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<FormsForm, Error, string>({
		mutationFn: formId => api.publishForm(formId),
		onSuccess: (updatedForm, formId) => {
			qc.setQueryData(orgKeys.form(formId), updatedForm);
			qc.invalidateQueries({ queryKey: orgKeys.forms(slug) });
		}
	});
};

export const useArchiveForm = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<FormsForm, Error, string>({
		mutationFn: formId => api.archiveForm(formId),
		onSuccess: (updatedForm, formId) => {
			qc.setQueryData(orgKeys.form(formId), updatedForm);
			qc.invalidateQueries({ queryKey: orgKeys.forms(slug) });
		}
	});
};

export const useDeleteForm = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: formId => api.deleteForm(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.forms(slug) })
	});
};

export const useUploadFormCoverImage = (formId: string) => {
	const qc = useQueryClient();

	return useMutation<FormsFormCoverUploadResponse, Error, File>({
		mutationFn: file => api.uploadFormCoverImage(formId, file),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.form(formId) })
	});
};

export const useFormFonts = () =>
	useQuery<FormsFont[]>({
		queryKey: formKeys.fonts,
		queryFn: () => api.getFormFonts(),
		staleTime: 1000 * 60 * 10
	});

export const useGoogleSheetEmail = () =>
	useQuery<FormsGoogleSheetEmailResponse>({
		queryKey: ["forms", "google-sheet-email"],
		queryFn: () => api.getGoogleSheetEmail(),
		staleTime: 1000 * 60 * 60 // email rarely changes
	});

export const useVerifyGoogleSheet = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsGoogleSheetVerifyResponse, Error, FormsGoogleSheetVerifyRequest>({
		mutationFn: req => api.verifyGoogleSheet(req),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.form(formId) })
	});
};
