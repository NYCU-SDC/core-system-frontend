import { api } from "@/lib/request/api.ts";
import type { ChoiceOption, QuestionType } from "@/types/form.ts";

export async function updateQuestion(formId: string, questionId: string, data: {
	required: boolean,
	type: QuestionType,
	title: string,
	description: string,
	order: number,
	choices?: ChoiceOption[]
}) {
	return api(`/forms/${formId}/questions/${questionId}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}