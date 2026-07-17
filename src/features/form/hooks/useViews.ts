import type { ViewsUpdateViewRequest } from "@/features/form/services/api";
import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useViews = (formId: string | undefined) =>
	useQuery({
		queryKey: formKeys.views(formId ?? ""),
		queryFn: () => api.listViews(formId!),
		enabled: !!formId
	});

export const useCreateView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => api.createView(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.views(formId) })
	});
};

export const useDuplicateView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (viewId: string) => api.duplicateView(formId, viewId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.views(formId) })
	});
};

export const useUpdateView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ viewId, req }: { viewId: string; req: ViewsUpdateViewRequest; invalidate?: boolean }) => api.updateView(formId, viewId, req),
		onSuccess: (_data, variables) => {
			if (variables.invalidate !== false) void qc.invalidateQueries({ queryKey: formKeys.views(formId) });
		}
	});
};

export const useLockView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (viewId: string) => api.lockView(formId, viewId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.views(formId) })
	});
};

export const useUnlockView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (viewId: string) => api.unlockView(formId, viewId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.views(formId) })
	});
};

export const useDeleteView = (formId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (viewId: string) => api.deleteView(formId, viewId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.views(formId) })
	});
};
