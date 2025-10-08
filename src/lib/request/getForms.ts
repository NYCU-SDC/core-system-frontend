import type { FormsResponse } from "@/types/forms.ts";
import { api } from "@/lib/request/api.ts";

export async function getForms(slug: string, unitId: string): Promise<FormsResponse> {
	console.log("Hello from getForms");
	const res = await api<FormsResponse>(`/orgs/${slug}/units/${unitId}/forms`);
	console.log("Really?")
	return res;
}