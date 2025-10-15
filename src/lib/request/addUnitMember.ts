import { api } from "@/lib/request/api.ts";
import type { MemberRequest } from "@/types/organization.ts";

export async function addUnitMember(orgSlug: string, unitId: string, member: MemberRequest) {
	return api(`/orgs/${orgSlug}/units/${unitId}/members`, {
		method: "POST",
		body: JSON.stringify(member)
	});
}
