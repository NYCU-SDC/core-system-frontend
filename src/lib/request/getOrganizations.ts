import type { OrganizationResponse } from "@/types/organization.ts";
import { api } from "./api";

export async function getOrganizations(): Promise<OrganizationResponse[]> {
	return api<OrganizationResponse[]>(`/orgs`);
}
