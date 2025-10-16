import { api } from "@/lib/request/api.ts";

export interface FormAnswerRequest {
	answers: {
		questionId: string;
		value: string;
	}[];
}

export async function submitFormResponse(formId: string, answers: FormAnswerRequest): Promise<void> {
	return api(`/forms/${formId}/responses`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(answers)
	});
}
