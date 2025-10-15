import type { ItemType, InboxItem, InboxListResponse } from "@/types/inbox.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInbox } from "@/lib/request/updateInbox.ts";

export function useUpdateInbox() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, flags }: { id: string; flags: ItemType }): Promise<InboxItem> => {
            return updateInbox(id, flags);
        },
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["Inbox"] });

            // Snapshot the previous value
            const previousInbox = queryClient.getQueryData<InboxListResponse>(["Inbox"]);

            // Optimistically update to the new value
            if (previousInbox) {
                queryClient.setQueryData<InboxListResponse>(["Inbox"], {
                    ...previousInbox,
                    items: previousInbox.items.map(item =>
                        item.id === variables.id
                            ? { ...item, ...variables.flags }
                            : item
                    )
                });
            }

            // Return a context object with the snapshotted value
            return { previousInbox };
        },
        onSuccess: (data: InboxItem, variables) => {
            console.log(`Succeed to update inbox item ${variables.id}:`);
        },
        onError: (error, variables, context) => {
            console.error(`Failed to update inbox item ${variables.id}:`, error);
            // Rollback to the previous value on error
            if (context?.previousInbox) {
                queryClient.setQueryData(["Inbox"], context.previousInbox);
            }
        },
    });
}