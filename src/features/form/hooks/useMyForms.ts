import * as api from "@/features/form/services/api";
import type { ResponsesCreateResponse } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMyForms = () =>
	useQuery({
		queryKey: ["forms", "me"],
		queryFn: () => api.listMyForms()
	});

export const useCreateFormResponse = () => {
	const qc = useQueryClient();

	return useMutation<ResponsesCreateResponse, Error, string>({
		mutationFn: (formId: string) => api.createFormResponse(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["forms", "me"] })
	});
};
