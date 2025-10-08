import { api } from "@/lib/request/api.ts";
import type { FormQuestionResponses } from "@/types/question.ts";

export async function getResponses(formId: string): Promise<FormQuestionResponses> {
	return api<FormQuestionResponses>(`/forms/${formId}/responses`);
}