import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import type {
	FormsFont,
	FormsListSectionsResponse,
	FormsQuestionRequest,
	FormsQuestionResponse,
	FormsSection,
	FormsSectionRequest,
	ResponsesAnswersRequest,
	ResponsesDateAnswer,
	ResponsesScaleAnswer,
	ResponsesStringAnswer,
	ResponsesStringArrayAnswer
} from "@nycu-sdc/core-system-sdk";
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
		mutationKey: ["form-editor", formId, "questions", sectionId, "create"],
		mutationFn: req => api.createQuestion(sectionId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const useUpdateQuestion = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsQuestionResponse, Error, { questionId: string; req: FormsQuestionRequest }>({
		mutationKey: ["form-editor", formId, "questions", sectionId, "update"],
		mutationFn: ({ questionId, req }) => api.updateQuestion(sectionId, questionId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const useDeleteQuestion = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, string>({
		mutationKey: ["form-editor", formId, "questions", sectionId, "delete"],
		mutationFn: questionId => api.deleteQuestion(sectionId, questionId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const useUpdateSection = (formId: string, sectionId: string) => {
	const qc = useQueryClient();
	return useMutation<FormsSection, Error, FormsSectionRequest>({
		mutationKey: ["form-editor", formId, "section", sectionId],
		mutationFn: req => api.updateSection(formId, sectionId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.sections(formId) })
	});
};

export const buildAnswersPayload = (sections: FormsSection[], answers: Record<string, string>, otherTexts: Record<string, string>): ResponsesAnswersRequest | null => {
	const questionTypeMap: Record<string, string> = {};
	sections.forEach(section => {
		section.questions?.forEach(question => {
			questionTypeMap[question.id] = question.type;
		});
	});

	const answersArray = Object.entries(answers)
		.filter(([questionId]) => sections.some(section => section.questions?.some(q => q.id === questionId)))
		.filter(([questionId, value]) => value !== "" && !["UPLOAD_FILE", "OAUTH_CONNECT"].includes(questionTypeMap[questionId]))
		.map(([questionId, value]) => {
			const questionType = questionTypeMap[questionId];
			const stringArrayTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"];
			const dateTypes = ["DATE"];
			const scaleTypes = ["LINEAR_SCALE", "RATING"];

			if (dateTypes.includes(questionType)) {
				return { questionId, questionType: "DATE" as const, value } as ResponsesDateAnswer;
			}
			if (scaleTypes.includes(questionType)) {
				return { questionId, questionType: questionType as ResponsesScaleAnswer["questionType"], value: parseInt(value, 10) } as ResponsesScaleAnswer;
			}
			if (stringArrayTypes.includes(questionType)) {
				const valueArray = value.includes(",") ? value.split(",") : [value];
				const otherText = otherTexts[questionId]?.trim();
				return { questionId, questionType: questionType as ResponsesStringArrayAnswer["questionType"], value: valueArray, ...(otherText ? { otherText } : {}) } as ResponsesStringArrayAnswer;
			}
			return { questionId, questionType: questionType as ResponsesStringAnswer["questionType"], value } as ResponsesStringAnswer;
		});

	if (answersArray.length === 0) return null;
	return {
		answers: answersArray as (ResponsesStringAnswer | ResponsesStringArrayAnswer | ResponsesScaleAnswer | ResponsesDateAnswer)[]
	} satisfies ResponsesAnswersRequest;
};
