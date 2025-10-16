import type { UnitResponse } from "@/types/unit.ts";
import { api } from "@/lib/request/api.ts";

export async function getUnit(slug: string, id: string): Promise<UnitResponse> {
	return api<UnitResponse>(`/orgs/${slug}/units/${id}`);
}
