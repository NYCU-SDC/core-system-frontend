import * as api from "@/features/form/services/api";
import { formKeys } from "@/shared/queryKeys/org";
import type { ResponsesCreateResponse } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMyForms = () =>
	useQuery({
		queryKey: formKeys.myForms,
		queryFn: () => api.listMyForms()
	});

export const useCreateFormResponse = () => {
	const qc = useQueryClient();

	return useMutation<ResponsesCreateResponse, Error, string>({
		mutationFn: (formId: string) => api.createFormResponse(formId),
		onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.myForms })
	});
};
