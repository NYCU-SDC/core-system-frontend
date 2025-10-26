import { api } from "@/lib/request/api.ts";
import type { OrganizationRequest, OrganizationResponse } from "@/types/organization.ts";

export async function createOrganization(data: OrganizationRequest): Promise<OrganizationResponse> {
	return api<OrganizationResponse>("/orgs", {
		method: "POST",
		body: JSON.stringify(data)
	});
}
