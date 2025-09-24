import { api } from "@/lib/request/api.ts";

export async function publishForm(id: string, data: {orgId: string; unitIds: string[]}) {
	return api(`/forms/${id}/publish`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}