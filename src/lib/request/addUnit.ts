import type { UnitRequest } from "@/types/unit.ts";
import { api } from "@/lib/request/api.ts";

export default function addUnit(slug: string, unitRequest: UnitRequest) {
	return api(`/orgs/${slug}/units`, {
		method: "POST",
		body: JSON.stringify(unitRequest)
	});
}
