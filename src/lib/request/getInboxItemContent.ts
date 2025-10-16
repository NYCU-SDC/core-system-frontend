import type { InboxItemContentResponse } from "@/types/inbox.ts";
import { api } from "@/lib/request/api.ts";

export async function getInboxItemContent(id: string | null): Promise<InboxItemContentResponse[]> {
	return api<InboxItemContentResponse[]>(`/forms/${id}/questions`);
}
