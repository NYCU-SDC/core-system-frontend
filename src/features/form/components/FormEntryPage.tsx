import { useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useCreateFormResponse } from "@/features/form/hooks/useMyForms";
import { LoadingSpinner, useToast } from "@/shared/components";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Handles /forms/:formId — resolves to an existing response or creates a new one,
 * then redirects to /forms/:formId/:responseId.
 */
export const FormEntryPage = () => {
	const { formId } = useParams<{ formId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const creatingRef = useRef(false);

	const responsesQuery = useFormResponses(formId);
	const createResponseMutation = useCreateFormResponse();

	useEffect(() => {
		if (!formId || responsesQuery.isPending) return;

		if (responsesQuery.error) {
			pushToast({ title: "載入表單失敗", description: (responsesQuery.error as Error).message, variant: "error" });
			return;
		}

		const existing = responsesQuery.data?.responses?.[0];
		if (existing) {
			navigate(`/forms/${formId}/${existing.id}`, { replace: true });
			return;
		}

		// No existing response — create one (guard against double-fire)
		if (creatingRef.current) return;
		creatingRef.current = true;

		createResponseMutation.mutate(formId, {
			onSuccess: data => {
				navigate(`/forms/${formId}/${data.id}`, { replace: true });
			},
			onError: error => {
				creatingRef.current = false;
				pushToast({ title: "開始填寫失敗", description: error.message, variant: "error" });
			}
		});
	}, [formId, responsesQuery.isPending, responsesQuery.error, responsesQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

	return <LoadingSpinner />;
};
