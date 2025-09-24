import { api } from "@/lib/request/api.ts";
import type { OrganizationRequest, OrganizationResponse } from "@/types/organization.ts";

export async function updateOrganization(slug: string, organizationRequest: OrganizationRequest): Promise<OrganizationResponse> {
	console.log(organizationRequest);
	return api(`/orgs/${slug}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(organizationRequest)
	});
}
