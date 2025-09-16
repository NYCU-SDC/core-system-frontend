import { useQuery } from "@tanstack/react-query";
import { getOrganizations } from "@/lib/request/getOrganizations.ts";
import type { OrganizationResponse } from "@/types/organization.ts";

export function useGetOrganizations() {
	return useQuery<OrganizationResponse[]>({
		queryKey: ["Orgs"],
		queryFn: getOrganizations
	});
}
