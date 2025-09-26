import type { InboxItemResponse } from "@/types/inbox.ts";
import { api } from "@/lib/request/api.ts";

export async function getInboxItem(id: string): Promise<InboxItemResponse> {
    return api<InboxItemResponse>(`/inbox/${id}`);
}
