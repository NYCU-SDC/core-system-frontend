import { api } from "@/lib/request/api.ts";

export async function deleteForm(id: string) {
	return api(`/forms/${id}`, {
		method: "DELETE"
		//body: JSON.stringify(id),
	});
}
