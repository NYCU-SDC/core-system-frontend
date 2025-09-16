import type { OrganizationResponse } from "@/types/organization.ts";
import { api } from "@/lib/request/api.ts";

export async function getOrganization(slug: string): Promise<OrganizationResponse> {
	return api<OrganizationResponse>(`/orgs/${slug}`);
}
