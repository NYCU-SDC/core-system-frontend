
import {getInboxItem} from "@/lib/request/getInboxItem.ts";

import { useQuery } from "@tanstack/react-query";
import type {InboxItemResponse} from "@/types/inbox"


export function useGetInboxItem(id: string | null) {
    return useQuery<InboxItemResponse>({
        queryKey: ["Inbox", id],
        queryFn: () => getInboxItem(id),
        enabled: !!id,
        // placeholderData: {} as InboxItemResponse
    });
}