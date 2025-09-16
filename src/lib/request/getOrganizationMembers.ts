import { api } from "@/lib/request/api.ts";
import type { Member } from "@/types/organization.ts";

export async function getOrganizationMembers(slug: string): Promise<Member[]> {
	return api(`/orgs/${slug}/members`);
}
