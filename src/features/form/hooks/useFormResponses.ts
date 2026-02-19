import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import type {
	ResponsesAnswersRequest,
	ResponsesAnswersRequestUpdate,
	ResponsesGetFormResponse,
	ResponsesGetQuestionResponse,
	ResponsesListResponse,
	ResponsesQuestionFilesUploadResponse
} from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useFormResponses = (formId: string | undefined, enabled = true) =>
	useQuery<ResponsesListResponse>({
		queryKey: formKeys.responses(formId ?? ""),
		queryFn: () => api.listFormResponses(formId!),
		enabled: enabled && !!formId
	});

export const useFormResponse = (formId: string | undefined, responseId: string | undefined, enabled = true) =>
	useQuery<ResponsesGetFormResponse>({
		queryKey: formKeys.response(formId ?? "", responseId ?? ""),
		queryFn: () => api.getFormResponse(formId!, responseId!),
		enabled: enabled && !!formId && !!responseId
	});

export const useDeleteFormResponse = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: responseId => api.deleteFormResponse(formId, responseId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.responses(formId) })
	});
};

export const useGetQuestionResponse = (responseId: string | undefined, questionId: string | undefined, enabled = true) =>
	useQuery<ResponsesGetQuestionResponse>({
		queryKey: ["response", responseId ?? "", "question", questionId ?? ""],
		queryFn: () => api.getQuestionResponse(responseId!, questionId!),
		enabled: enabled && !!responseId && !!questionId
	});

export const useUpdateFormResponse = (responseId: string) =>
	useMutation<void, Error, ResponsesAnswersRequestUpdate>({
		mutationFn: answers => api.updateFormResponse(responseId, answers)
	});

export const useSubmitFormResponse = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, { responseId: string; answers: ResponsesAnswersRequest }>({
		mutationFn: ({ responseId, answers }) => api.submitFormResponse(responseId, answers),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["forms", "me"] });
			qc.invalidateQueries({ queryKey: formKeys.responses(formId) });
		}
	});
};

export const useUploadQuestionFiles = (responseId: string, questionId: string) =>
	useMutation<ResponsesQuestionFilesUploadResponse, Error, File[]>({
		mutationFn: files => api.uploadQuestionFiles(responseId, questionId, files)
	});
