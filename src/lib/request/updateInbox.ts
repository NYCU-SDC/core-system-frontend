import { api } from "@/lib/request/api.ts";
import type {ItemType, InboxItem} from "@/types/inbox.ts";

export async function updateInbox(id: string,flags: ItemType):Promise<InboxItem> {

    return api(`/inbox/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ flags })
    });
}
