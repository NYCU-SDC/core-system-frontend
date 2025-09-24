import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMember } from "@/lib/request/addMember.ts";
import type { MemberRequest } from "@/types/organization.ts";

type UseAddMemberOptions = {
	onSuccess?: () => void | Promise<void>;
	onError?: (err: unknown) => void;
};

export function useAddMember(slug: string, options?: UseAddMemberOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["addMember"],
		mutationFn: (member: MemberRequest) => addMember(slug, member),
		onSuccess: async () => {
			await options?.onSuccess?.();
			queryClient.invalidateQueries({ queryKey: ["OrgMembers", slug] });
		},
		onError: err => {
			console.error("Failed to add member:", err);
			options?.onError?.(err);
		}
	});
}
