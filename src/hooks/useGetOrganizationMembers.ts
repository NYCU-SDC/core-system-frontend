import { useQuery } from "@tanstack/react-query";
import { getOrganizationMembers } from "@/lib/request/getOrganizationMembers.ts";
import type { Member } from "@/types/organization.ts";

export function useGetOrganizationMembers(slug: string) {
	return useQuery<Member[]>({
		queryKey: ["OrgMembers", slug],
		queryFn: () => getOrganizationMembers(slug),
		enabled: !!slug,
		placeholderData: []
	});
}
