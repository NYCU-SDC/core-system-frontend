import { useQuery } from "@tanstack/react-query";
import type {InboxListResponse} from "@/types/inbox"
import {getInboxList} from "@/lib/request/getInboxList.ts";

export function useGetInboxList() {
    return useQuery<InboxListResponse[]>({
        queryKey: ["Inbox"],
        queryFn: () => getInboxList()
    });
}
