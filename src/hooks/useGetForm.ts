import { useQuery } from "@tanstack/react-query";
import type { FormResponse } from "@/types/form.ts";
import { getForm } from "@/lib/request/getForm.ts";

export function useGetForm(id: string) {
	return useQuery<FormResponse>({
		queryKey: ["Form", id],
		queryFn: () => getForm(id),
		enabled: id !== "new"
	});
}
