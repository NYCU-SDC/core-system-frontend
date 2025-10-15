import { api } from "@/lib/request/api.ts";

export async function deleteMember(orgSlug: string, memberId: string) {
	return api(`/orgs/${orgSlug}/members/${memberId}`, {
		method: "DELETE"
	});
}
