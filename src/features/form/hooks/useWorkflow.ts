import * as api from "@/features/form/services/api";
import { formKeys, orgKeys } from "@/shared/queryKeys/org";
import type { FormWorkflowCreateNodeRequest, FormWorkflowNodeRequest, FormWorkflowNodeResponse, FormWorkflowNodeStructure } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWorkflow = (formId: string | undefined, enabled = true) =>
	useQuery<FormWorkflowNodeResponse[]>({
		queryKey: formKeys.workflow(formId ?? ""),
		queryFn: async () => {
			const res = await api.getWorkflow(formId!);
			return res.workflow;
		},
		enabled: enabled && !!formId
	});

export const useUpdateWorkflow = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<FormWorkflowNodeResponse[], Error, FormWorkflowNodeRequest[]>({
		mutationFn: nodes => api.updateWorkflow(formId, nodes),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: formKeys.workflow(formId) });
			qc.invalidateQueries({ queryKey: formKeys.sections(formId) });
		}
	});
};

export const useCreateWorkflowNode = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<FormWorkflowNodeStructure, Error, FormWorkflowCreateNodeRequest>({
		mutationFn: req => api.createWorkflowNode(formId, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.workflow(formId) })
	});
};

export const useDeleteWorkflowNode = (formId: string) => {
	const qc = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: nodeId => api.deleteWorkflowNode(formId, nodeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: formKeys.workflow(formId) });
			qc.invalidateQueries({ queryKey: orgKeys.form(formId) });
		}
	});
};
