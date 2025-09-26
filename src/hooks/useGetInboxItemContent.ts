
import {getInboxItemContent} from "@/lib/request/getInboxItemContent.ts";

import { useQuery } from "@tanstack/react-query";
import type {InboxItemContentResponse} from "@/types/inbox"


export function useGetInboxItem(id: string) {
    return useQuery<InboxItemContentResponse[]>({
        queryKey: ["form", id],
        queryFn: () => getInboxItemContent(id)
    });
}