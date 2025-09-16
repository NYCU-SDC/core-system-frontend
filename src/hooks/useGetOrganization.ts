import { useQuery } from "@tanstack/react-query";
import type { OrganizationResponse } from "@/types/organization.ts";
import { getOrganization } from "@/lib/request/getOrganization.ts";

export function useGetOrganization(slug: string) {
	return useQuery<OrganizationResponse>({
		queryKey: ["Org", slug],
		queryFn: () => getOrganization(slug)
	});
}
