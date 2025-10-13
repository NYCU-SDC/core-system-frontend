import type { QuestionsResponse } from "@/types/form.ts";
import { api } from "@/lib/request/api.ts";

export async function getQuestions(formId: string): Promise<QuestionsResponse> {
	return api<QuestionsResponse>(`/forms/${formId}/questions`);
}
