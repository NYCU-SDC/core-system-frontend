import { api } from "@/lib/request/api.ts";
import type { OrganizationRequest, OrganizationResponse } from "@/types/organization.ts";

export async function updateOrganization(slug: string, organizationRequest: OrganizationRequest): Promise<OrganizationResponse> {
	return api(`/orgs/${slug}`, {
		method: "PUT",
		body: JSON.stringify(organizationRequest)
	});
}
