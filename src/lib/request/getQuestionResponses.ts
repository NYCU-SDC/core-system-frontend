import { api } from "@/lib/request/api.ts";
import type { Answers } from "@/types/question.ts";

export async function getQuestionResponses(formId: string, questionId: string): Promise<Answers> {
	return api<Answers>(`/forms/${formId}/questions/${questionId}`);
}