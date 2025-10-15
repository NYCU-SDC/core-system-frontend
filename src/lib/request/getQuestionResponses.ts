import { api } from "@/lib/request/api.ts";
import type { answer } from "@/types/question.ts";

export async function getQuestionResponses(formId: string, questionId: string): Promise<answer[]> {
	return api<answer[]>(`/forms/${formId}/questions/${questionId}`);
}
