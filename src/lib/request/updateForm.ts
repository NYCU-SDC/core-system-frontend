import { api } from "@/lib/request/api.ts";

export async function updateForm(id: string, data: {title: string; description: string}) {
	return api(`/forms/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}