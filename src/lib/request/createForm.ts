import { api } from "@/lib/request/api.ts";

export async function createForm(slug: string, unitId: string, data: {title: string; description: string}) {
	return api(`/orgs/${slug}/units/${unitId}/forms`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}