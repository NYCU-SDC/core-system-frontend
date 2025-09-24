import type { FormsResponse } from "@/types/forms.ts";
import { api } from "@/lib/request/api.ts";

export async function getForms(): Promise<FormsResponse> {
	console.log("Hello from getForms");
	const res = await api<FormsResponse>(`/forms`);
	console.log("Really?")
	return res;
}