import type { FormResponse } from "@/types/form.ts";
import { api } from "@/lib/request/api.ts";

export async function getForm(id: string): Promise<FormResponse> {
	return api<FormResponse>(`/forms/${id}`);
}
