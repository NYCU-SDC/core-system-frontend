
import {getInboxItemContent} from "@/lib/request/getInboxItemContent.ts";

import { useQuery } from "@tanstack/react-query";
import type {InboxItemContentResponse} from "@/types/inbox"


export default function useGetInboxItemContent(id: string | null) {
    return useQuery<InboxItemContentResponse[]>({
        queryKey: ["form", id],
        queryFn: () => getInboxItemContent(id),
        enabled: !!id,
        // placeholderData: [] as InboxItemContentResponse[]
    });
}