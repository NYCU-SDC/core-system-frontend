import { api } from "@/lib/request/api.ts";

export async function deleteUnit(orgSlug: string, unitId: string) {
	return api(`/orgs/${orgSlug}/units/${unitId}`, {
		method: "DELETE"
	});
}
