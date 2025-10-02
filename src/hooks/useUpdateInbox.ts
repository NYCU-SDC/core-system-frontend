import type { ItemType, InboxItem } from "@/types/inbox.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInbox } from "@/lib/request/updateInbox.ts";

export function useUpdateInbox() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, flags }: { id: string; flags: ItemType }): Promise<InboxItem> => {
            return updateInbox(id, flags);
        },
    onSuccess: (data:InboxItem, variables) => {
        // 更新整個 inbox 列表的快取
        queryClient.invalidateQueries({ queryKey: ["Inbox"] });
        console.error(`Succeed to update inbox item ${variables.id}:`);
        // 或者更新單個 item 的快取（如果有的話）
        //queryClient.setQueryData(["inbox", variables.id], data);
    },

    onError: (error, variables) => {
        console.error(`Failed to update inbox item ${variables.id}:`, error);
    },
});

}