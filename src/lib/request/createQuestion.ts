import { api } from "@/lib/request/api.ts";
import type { ChoiceOption, QuestionType } from "@/types/form.ts";

export async function createQuestion(
	formId: string,
	data: {
		required: boolean;
		type: QuestionType;
		title: string;
		description: string;
		order: number;
		choices?: ChoiceOption[];
	}
) {
	return api(`/forms/${formId}/questions`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}
