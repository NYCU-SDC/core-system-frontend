import type { InboxItemResponse } from "@/types/inbox.ts";
import { api } from "@/lib/request/api.ts";

export async function getInboxItem(id: string | null): Promise<InboxItemResponse> {
	return api<InboxItemResponse>(`/inbox/${id}`);
}
