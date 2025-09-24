import { useQuery } from "@tanstack/react-query";
import type { FormsResponse } from "@/types/forms.ts";
import { getForms } from "@/lib/request/getForms.ts";

export function useGetForms() {
	console.log("Hello from useGetForms");
	const query =  useQuery<FormsResponse>({
		queryKey: ['Forms'],
		queryFn: async () => {
			const res = await getForms();
			console.log("Data fetched in useGetForms:", res);
			return res;
		} ,

	})
	console.log("Define complete")
	return query
}