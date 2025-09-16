import { api } from "@/lib/request/api.ts";

export async function addMember(orgSlug: string, member: string) {
	return api(`/orgs/${orgSlug}/members`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ member })
	});
}
