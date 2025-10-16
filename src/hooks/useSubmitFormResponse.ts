import { useMutation } from "@tanstack/react-query";
import { submitFormResponse, type FormAnswerRequest } from "@/lib/request/submitFormResponse";

export function useSubmitFormResponse() {
	return useMutation({
		mutationFn: ({ formId, answers }: { formId: string; answers: FormAnswerRequest }) => {
			return submitFormResponse(formId, answers);
		},
		onSuccess: () => {
			console.log("Form submitted successfully!");
		},
		onError: error => {
			console.error("Failed to submit form:", error);
		}
	});
}
