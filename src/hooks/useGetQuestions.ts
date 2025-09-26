import { useQuery } from "@tanstack/react-query";
import type { QuestionsResponse } from "@/types/form.ts";
import { getQuestions } from "@/lib/request/getQuestions.ts";

export function useGetQuestions(formId: string) {
	return useQuery<QuestionsResponse>({
		queryKey: ["Questions", formId],
		queryFn:() => getQuestions(formId),
		enabled: formId !== "new"
	})
}