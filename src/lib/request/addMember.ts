import { api } from "@/lib/request/api.ts";
import type { MemberRequest } from "@/types/organization.ts";

export async function addMember(orgSlug: string, member: MemberRequest) {
	return api(`/orgs/${orgSlug}/members`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ member })
	});
}
