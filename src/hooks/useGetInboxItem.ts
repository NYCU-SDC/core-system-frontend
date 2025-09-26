
import {getInboxItem} from "@/lib/request/getInboxItem.ts";

import { useQuery } from "@tanstack/react-query";
import type {InboxItemResponse} from "@/types/inbox"


export function useGetInboxItem(id: string) {
    return useQuery<InboxItemResponse>({
        queryKey: ["Inbox", id],
        queryFn: () => getInboxItem(id)
    });
}