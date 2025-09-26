import { api } from "@/lib/request/api.ts";

export async function deleteQuestion(formId: string, questionId: string) {
	return api(`/forms/${formId}/questions/${questionId}`, {
		method: "DELETE",
	});
}