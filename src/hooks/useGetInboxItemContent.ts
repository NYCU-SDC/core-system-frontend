
import {getInboxItemContent} from "@/lib/request/getInboxItemContent.ts";

import { useQuery } from "@tanstack/react-query";
import type {InboxItemContentResponse} from "@/types/inbox"


export default function useGetInboxItemContent(id: string | null) {
    return useQuery<InboxItemContentResponse[]>({
        queryKey: ["form", id],
        queryFn: () => getInboxItemContent(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        // placeholderData: [] as InboxItemContentResponse[]
    });
}