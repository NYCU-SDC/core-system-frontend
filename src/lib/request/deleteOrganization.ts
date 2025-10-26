import { api } from "@/lib/request/api.ts";

export async function deleteOrganization(orgSlug: string) {
	return api(`/orgs/${orgSlug}`, {
		method: "DELETE"
	});
}
