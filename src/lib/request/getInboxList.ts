import { api } from "@/lib/request/api.ts";
import type { InboxListResponse } from "@/types/inbox";

export async function getInboxList(): Promise<InboxListResponse[]> {
    return api<InboxListResponse[]>(`/inbox`);
}