import type { FormsResponse } from "@/types/forms.ts";
import { api } from "@/lib/request/api.ts";

export async function getForms(): Promise<FormsResponse> {
	return api<FormsResponse>(`/forms`);
}