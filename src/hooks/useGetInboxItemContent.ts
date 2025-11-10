import { getInboxItemContent } from "@/lib/request/getInboxItemContent.ts";

import { useQuery } from "@tanstack/react-query";
import type { InboxItemContentResponse } from "@/types/inbox";

export default function useGetInboxItemContent(id: string | null) {
	return useQuery<InboxItemContentResponse[]>({
		queryKey: ["form", id],
		queryFn: () => getInboxItemContent(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes - prevents unnecessary refetches
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		refetchOnWindowFocus: false, // Don't refetch when user tabs back
		refetchOnReconnect: false, // Don't refetch on network reconnect
		refetchOnMount: false // Don't refetch if data exists in cache
	});
}
