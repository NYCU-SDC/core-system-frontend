import type { UnitResponse } from "@/types/unit.ts";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationUnits } from "@/lib/request/getOrganizationUnits.ts";

export function useGetUnits(slug: string) {
	return useQuery<UnitResponse[]>({
		queryKey: ["OrgUnits", slug],
		queryFn: () => getOrganizationUnits(slug),
		enabled: !!slug,
		placeholderData: []
	});
}
