import { withAuthRefreshRetry } from "@/features/auth/services/authService";
import type {
	FormWorkflowCreateNodeRequest,
	FormWorkflowGetWorkflowResponse,
	FormWorkflowNodeRequest,
	FormWorkflowNodeResponse,
	FormWorkflowNodeStructure,
	FormsFont,
	FormsForm,
	FormsFormCoverUploadResponse,
	FormsFormRequest,
	FormsFormRequestUpdate,
	FormsGoogleSheetEmailResponse,
	FormsGoogleSheetVerifyRequest,
	FormsGoogleSheetVerifyResponse,
	FormsListSectionsResponse,
	FormsQuestionRequest,
	FormsQuestionResponse,
	FormsSection,
	FormsSectionRequest,
	ResponsesCreateResponse,
	ResponsesGetFormResponse,
	ResponsesGetQuestionResponse,
	ResponsesListResponse,
	ResponsesQuestionFilesUploadResponse,
	UnitUserForm
} from "@nycu-sdc/core-system-sdk";
import {
	formWorkflowCreateNode,
	formWorkflowDeleteNode,
	formWorkflowGetWorkflow,
	formWorkflowUpdateWorkflow,
	formsArchiveForm,
	formsCreateQuestion,
	formsDeleteForm,
	formsDeleteQuestion,
	formsGetFormById,
	formsGetFormFonts,
	formsGetGoogleSheetEmail,
	formsListSections,
	formsPublishForm,
	formsUpdateForm,
	formsUpdateQuestion,
	formsUpdateSection,
	formsUploadFormCoverImage,
	formsVerifyGoogleSheet,
	responsesCreateFormResponse,
	responsesDeleteFormResponse,
	responsesGetFormResponse,
	responsesGetQuestionResponse,
	responsesListFormResponses,
	responsesSubmitFormResponse,
	responsesUpdateFormResponse,
	responsesUploadQuestionFiles,
	unitCreateOrgForm,
	unitListFormsByOrg,
	unitListFormsOfCurrentUser
} from "@nycu-sdc/core-system-sdk";
import { assertOk } from "../../../shared/utils/apiError";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

// ── Forms ──────────────────────────────────────────────────────────────────

export const listOrgForms = async (slug: string): Promise<FormsForm[]> => {
	const res = await withAuthRefreshRetry(() => unitListFormsByOrg(slug, defaultRequestOptions));
	assertOk(res.status, "Failed to load forms", res.data);
	return res.data;
};

export const createOrgForm = async (slug: string, req: FormsFormRequest): Promise<FormsForm> => {
	const res = await withAuthRefreshRetry(() => unitCreateOrgForm(slug, req, defaultRequestOptions));
	assertOk(res.status, "Failed to create form", res.data);
	return res.data;
};

export const getFormById = async (formId: string): Promise<FormsForm> => {
	const res = await withAuthRefreshRetry(() => formsGetFormById(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to load form", res.data);
	return res.data;
};

export const updateForm = async (formId: string, req: FormsFormRequestUpdate): Promise<FormsForm> => {
	const res = await withAuthRefreshRetry(() => formsUpdateForm(formId, req, defaultRequestOptions));
	assertOk(res.status, "Failed to update form", res.data);
	return res.data;
};

export const publishForm = async (formId: string): Promise<FormsForm> => {
	const res = await withAuthRefreshRetry(() => formsPublishForm(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to publish form", res.data);
	// publishForm returns FormPublishResponse which has same shape as Form
	return res.data as unknown as FormsForm;
};

export const archiveForm = async (formId: string): Promise<FormsForm> => {
	const res = await withAuthRefreshRetry(() => formsArchiveForm(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to archive form", res.data);
	return res.data;
};

export const deleteForm = async (formId: string): Promise<void> => {
	const res = await withAuthRefreshRetry(() => formsDeleteForm(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to delete form", res.data);
};

export const uploadFormCoverImage = async (formId: string, file: File): Promise<FormsFormCoverUploadResponse> => {
	const res = await withAuthRefreshRetry(() => formsUploadFormCoverImage(formId, { coverImage: file }, defaultRequestOptions));
	assertOk(res.status, "Failed to upload cover image", res.data);
	return res.data;
};

export const getFormFonts = async (): Promise<FormsFont[]> => {
	const res = await withAuthRefreshRetry(() => formsGetFormFonts(defaultRequestOptions));
	assertOk(res.status, "Failed to load fonts", res.data);
	return res.data;
};

// ── Sections & Questions ──────────────────────────────────────────────────

export const listSections = async (formId: string): Promise<FormsListSectionsResponse[]> => {
	const res = await withAuthRefreshRetry(() => formsListSections(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to load sections", res.data);

	const raw = res.data as unknown;

	// Normalize: the actual API may return [{section:{...}, questions:[...]}]
	// instead of the SDK-typed [{sections: FormsSection[]}].
	if (Array.isArray(raw) && raw.length > 0 && raw[0] !== null && typeof raw[0] === "object" && "section" in (raw[0] as object)) {
		const normalized: FormsSection[] = (raw as Array<{ section: FormsSection; questions: FormsQuestionResponse[] | null }>).map(item => ({
			...item.section,
			questions: item.questions ?? []
		}));
		return [{ sections: normalized }];
	}

	return res.data;
};

export const updateSection = async (formId: string, sectionId: string, req: FormsSectionRequest): Promise<FormsSection> => {
	const res = await withAuthRefreshRetry(() => formsUpdateSection(formId, sectionId, req, defaultRequestOptions));
	assertOk(res.status, "Failed to update section", res.data);
	return res.data;
};

export const createQuestion = async (sectionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await withAuthRefreshRetry(() => formsCreateQuestion(sectionId, req, defaultRequestOptions));
	assertOk(res.status, "Failed to create question", res.data);
	return res.data;
};

export const updateQuestion = async (sectionId: string, questionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await withAuthRefreshRetry(() => formsUpdateQuestion(sectionId, questionId, req, defaultRequestOptions));
	assertOk(res.status, "Failed to update question", res.data);
	return res.data;
};

export const deleteQuestion = async (sectionId: string, questionId: string): Promise<void> => {
	const res = await withAuthRefreshRetry(() => formsDeleteQuestion(sectionId, questionId, defaultRequestOptions));
	assertOk(res.status, "Failed to delete question", res.data);
};

// ── Workflow ──────────────────────────────────────────────────────────────

export const getWorkflow = async (formId: string): Promise<FormWorkflowGetWorkflowResponse> => {
	const res = await withAuthRefreshRetry(() => formWorkflowGetWorkflow(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to load workflow", res.data);
	return res.data as FormWorkflowGetWorkflowResponse;
};

export const updateWorkflow = async (formId: string, nodes: FormWorkflowNodeRequest[]): Promise<FormWorkflowNodeResponse[]> => {
	const res = await withAuthRefreshRetry(() => formWorkflowUpdateWorkflow(formId, nodes, defaultRequestOptions));
	assertOk(res.status, "Failed to update workflow", res.data);
	return res.data as FormWorkflowNodeResponse[];
};

export const createWorkflowNode = async (formId: string, req: FormWorkflowCreateNodeRequest): Promise<FormWorkflowNodeStructure> => {
	const res = await withAuthRefreshRetry(() => formWorkflowCreateNode(formId, req, defaultRequestOptions));
	assertOk(res.status, "Failed to create workflow node", res.data);
	return res.data as FormWorkflowNodeStructure;
};

export const deleteWorkflowNode = async (formId: string, nodeId: string): Promise<void> => {
	const res = await withAuthRefreshRetry(() => formWorkflowDeleteNode(formId, nodeId, defaultRequestOptions));
	assertOk(res.status, "Failed to delete workflow node", res.data);
};

// ── User Forms ────────────────────────────────────────────────────────────

export const listMyForms = async (): Promise<UnitUserForm[]> => {
	const res = await withAuthRefreshRetry(() => unitListFormsOfCurrentUser(defaultRequestOptions));
	assertOk(res.status, "Failed to load my forms", res.data);
	return res.data;
};

// ── Responses ─────────────────────────────────────────────────────────────

export const createFormResponse = async (formId: string): Promise<ResponsesCreateResponse> => {
	const res = await withAuthRefreshRetry(() => responsesCreateFormResponse(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to start form", res.data);
	return res.data as ResponsesCreateResponse;
};

export const listFormResponses = async (formId: string): Promise<ResponsesListResponse> => {
	const res = await withAuthRefreshRetry(() => responsesListFormResponses(formId, defaultRequestOptions));
	assertOk(res.status, "Failed to load responses", res.data);
	return res.data as ResponsesListResponse;
};

export const getFormResponse = async (formId: string, responseId: string): Promise<ResponsesGetFormResponse> => {
	const res = await withAuthRefreshRetry(() => responsesGetFormResponse(formId, responseId, defaultRequestOptions));
	assertOk(res.status, "Failed to load response", res.data);
	return res.data as ResponsesGetFormResponse;
};

export const deleteFormResponse = async (formId: string, responseId: string): Promise<void> => {
	const res = await withAuthRefreshRetry(() => responsesDeleteFormResponse(formId, responseId, defaultRequestOptions));
	assertOk(res.status, "Failed to delete response", res.data);
};

export const updateFormResponse = async (responseId: string, answers: import("@nycu-sdc/core-system-sdk").ResponsesAnswersRequestUpdate): Promise<void> => {
	const res = await withAuthRefreshRetry(() => responsesUpdateFormResponse(responseId, answers, defaultRequestOptions));
	assertOk(res.status, "Failed to save answers", res.data);
};

export const submitFormResponse = async (responseId: string, answers: import("@nycu-sdc/core-system-sdk").ResponsesAnswersRequest): Promise<void> => {
	const res = await withAuthRefreshRetry(() => responsesSubmitFormResponse(responseId, answers, defaultRequestOptions));
	assertOk(res.status, "Failed to submit form", res.data);
};

export const uploadQuestionFiles = async (responseId: string, questionId: string, files: File[]): Promise<ResponsesQuestionFilesUploadResponse> => {
	const res = await withAuthRefreshRetry(() =>
		responsesUploadQuestionFiles(responseId, questionId, { files } as unknown as import("@nycu-sdc/core-system-sdk").ResponsesQuestionFilesUploadRequest, defaultRequestOptions)
	);
	assertOk(res.status, "Failed to upload files", res.data);
	return res.data as ResponsesQuestionFilesUploadResponse;
};

export const getQuestionResponse = async (responseId: string, questionId: string): Promise<ResponsesGetQuestionResponse> => {
	const res = await withAuthRefreshRetry(() => responsesGetQuestionResponse(responseId, questionId, defaultRequestOptions));
	assertOk(res.status, "Failed to get question response", res.data);
	return res.data as ResponsesGetQuestionResponse;
};

// ── Google Sheet ──────────────────────────────────────────────────────────

export const getGoogleSheetEmail = async (): Promise<FormsGoogleSheetEmailResponse> => {
	const res = await withAuthRefreshRetry(() => formsGetGoogleSheetEmail(defaultRequestOptions));
	assertOk(res.status, "Failed to load Google Sheet email", res.data);
	return res.data;
};

export const verifyGoogleSheet = async (req: FormsGoogleSheetVerifyRequest): Promise<FormsGoogleSheetVerifyResponse> => {
	const res = await withAuthRefreshRetry(() => formsVerifyGoogleSheet(req, defaultRequestOptions));
	assertOk(res.status, "Failed to verify Google Sheet", res.data);
	return res.data;
};
