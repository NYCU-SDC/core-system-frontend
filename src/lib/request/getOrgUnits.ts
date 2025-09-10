import type { UnitResponse } from "@/types/unit.ts";

export async function getOrgUnits(slug: string): Promise<UnitResponse[]> {
	const response = await fetch(`/api/org-units/${slug}`, {
		credentials: "include"
	});
	if (!response.ok) {
		throw new Error("Failed to fetch organizational units");
	}
	return response.json();
}
