import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrganization } from "@/lib/request/updateOrganization.ts";
import type { OrganizationRequest } from "@/types/organization.ts";

type UseUpdateOrganizationOptions = {
	onSuccess?: () => void | Promise<void>;
	onError?: (err: unknown) => void;
};

export function useUpdateOrganization(slug: string, options?: UseUpdateOrganizationOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: OrganizationRequest) => updateOrganization(slug, request),
		onSuccess: async () => {
			await options?.onSuccess?.();
			queryClient.invalidateQueries({ queryKey: ["Org", slug] });
		},
		onError: err => {
			console.error("Failed to update organization:", err);
			options?.onError?.(err);
		}
	});
}
