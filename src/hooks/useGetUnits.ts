import type { UnitResponse } from "@/types/unit.ts";
import { useQuery } from "@tanstack/react-query";

export default function useGetUnits(slug: string) {
	useQuery<UnitResponse[]>({
		queryKey: ["groups", slug],
        queryFn:
	});
}
