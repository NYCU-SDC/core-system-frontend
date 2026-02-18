import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import type { FormsFont, FormsListSectionsResponse, FormsQuestionRequest, FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSections = (formId: string | undefined, enabled = true) =>
	useQuery<FormsListSectionsResponse[]>({
		queryKey: formKeys.sections(formId ?? ""),
		queryFn: () => api.listSections(formId!),
		enabled: enabled && !!formId
	});

export const useFormFonts = () =>
	useQuery<FormsFont[]>({
		queryKey: formKeys.fonts,
		queryFn: () => api.getFormFonts(),
		staleTime: 1000 * 60 * 10 // fonts rarely change
	});

export const useCreateQuestion = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsQuestionResponse, Error, FormsQuestionRequest>({
		mutationFn: req => api.createQuestion(sectionId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const useUpdateQuestion = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsQuestionResponse, Error, { questionId: string; req: FormsQuestionRequest }>({
		mutationFn: ({ questionId, req }) => api.updateQuestion(sectionId, questionId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const useDeleteQuestion = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: questionId => api.deleteQuestion(sectionId, questionId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};
