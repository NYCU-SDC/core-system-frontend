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
	FormsListSectionsResponse,
	FormsQuestionRequest,
	FormsQuestionResponse,
	ResponsesCreateResponse,
	ResponsesGetFormResponse,
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
	formsListSections,
	formsPublishForm,
	formsUpdateForm,
	formsUpdateQuestion,
	formsUploadFormCoverImage,
	responsesCreateFormResponse,
	responsesDeleteFormResponse,
	responsesGetFormResponse,
	responsesListFormResponses,
	responsesSubmitFormResponse,
	responsesUpdateFormResponse,
	responsesUploadQuestionFiles,
	unitCreateOrgForm,
	unitListFormsByOrg,
	unitListFormsOfCurrentUser
} from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const assertOk = (status: number, message: string) => {
	if (status < 200 || status >= 300) {
		throw new Error(`${message} (status ${status})`);
	}
};

// ── Forms ──────────────────────────────────────────────────────────────────

export const listOrgForms = async (slug: string): Promise<FormsForm[]> => {
	const res = await unitListFormsByOrg(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to load forms");
	return res.data;
};

export const createOrgForm = async (slug: string, req: FormsFormRequest): Promise<FormsForm> => {
	const res = await unitCreateOrgForm(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create form");
	return res.data;
};

export const getFormById = async (formId: string): Promise<FormsForm> => {
	const res = await formsGetFormById(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load form");
	return res.data;
};

export const updateForm = async (formId: string, req: FormsFormRequestUpdate): Promise<FormsForm> => {
	const res = await formsUpdateForm(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update form");
	return res.data;
};

export const publishForm = async (formId: string): Promise<FormsForm> => {
	const res = await formsPublishForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to publish form");
	// publishForm returns FormPublishResponse which has same shape as Form
	return res.data as unknown as FormsForm;
};

export const archiveForm = async (formId: string): Promise<FormsForm> => {
	const res = await formsArchiveForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to archive form");
	return res.data;
};

export const deleteForm = async (formId: string): Promise<void> => {
	const res = await formsDeleteForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete form");
};

export const uploadFormCoverImage = async (formId: string, file: File): Promise<FormsFormCoverUploadResponse> => {
	const res = await formsUploadFormCoverImage(formId, { file }, defaultRequestOptions);
	assertOk(res.status, "Failed to upload cover image");
	return res.data;
};

export const getFormFonts = async (): Promise<FormsFont[]> => {
	const res = await formsGetFormFonts(defaultRequestOptions);
	assertOk(res.status, "Failed to load fonts");
	return res.data;
};

// ── Sections & Questions ──────────────────────────────────────────────────

export const listSections = async (formId: string): Promise<FormsListSectionsResponse[]> => {
	const res = await formsListSections(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load sections");
	return res.data;
};

export const createQuestion = async (sectionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await formsCreateQuestion(sectionId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create question");
	return res.data;
};

export const updateQuestion = async (sectionId: string, questionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await formsUpdateQuestion(sectionId, questionId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update question");
	return res.data;
};

export const deleteQuestion = async (sectionId: string, questionId: string): Promise<void> => {
	const res = await formsDeleteQuestion(sectionId, questionId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete question");
};

// ── Workflow ──────────────────────────────────────────────────────────────

export const getWorkflow = async (formId: string): Promise<FormWorkflowGetWorkflowResponse> => {
	const res = await formWorkflowGetWorkflow(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load workflow");
	return res.data;
};

export const updateWorkflow = async (formId: string, nodes: FormWorkflowNodeRequest[]): Promise<FormWorkflowNodeResponse[]> => {
	const res = await formWorkflowUpdateWorkflow(formId, nodes, defaultRequestOptions);
	assertOk(res.status, "Failed to update workflow");
	return res.data;
};

export const createWorkflowNode = async (formId: string, req: FormWorkflowCreateNodeRequest): Promise<FormWorkflowNodeStructure> => {
	const res = await formWorkflowCreateNode(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create workflow node");
	return res.data;
};

export const deleteWorkflowNode = async (formId: string, nodeId: string): Promise<void> => {
	const res = await formWorkflowDeleteNode(formId, nodeId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete workflow node");
};

// ── User Forms ────────────────────────────────────────────────────────────

export const listMyForms = async (): Promise<UnitUserForm[]> => {
	const res = await unitListFormsOfCurrentUser(defaultRequestOptions);
	assertOk(res.status, "Failed to load my forms");
	return res.data;
};

// ── Responses ─────────────────────────────────────────────────────────────

export const createFormResponse = async (formId: string): Promise<ResponsesCreateResponse> => {
	const res = await responsesCreateFormResponse(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to start form");
	return res.data as ResponsesCreateResponse;
};

export const listFormResponses = async (formId: string): Promise<ResponsesListResponse> => {
	const res = await responsesListFormResponses(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load responses");
	return res.data;
};

export const getFormResponse = async (formId: string, responseId: string): Promise<ResponsesGetFormResponse> => {
	const res = await responsesGetFormResponse(formId, responseId, defaultRequestOptions);
	assertOk(res.status, "Failed to load response");
	return res.data;
};

export const deleteFormResponse = async (formId: string, responseId: string): Promise<void> => {
	const res = await responsesDeleteFormResponse(formId, responseId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete response");
};

export const updateFormResponse = async (responseId: string, answers: import("@nycu-sdc/core-system-sdk").ResponsesAnswersRequestUpdate): Promise<void> => {
	const res = await responsesUpdateFormResponse(responseId, answers, defaultRequestOptions);
	assertOk(res.status, "Failed to save answers");
};

export const submitFormResponse = async (responseId: string, answers: import("@nycu-sdc/core-system-sdk").ResponsesAnswersRequest): Promise<void> => {
	const res = await responsesSubmitFormResponse(responseId, answers, defaultRequestOptions);
	assertOk(res.status, "Failed to submit form");
};

export const uploadQuestionFiles = async (responseId: string, questionId: string, files: File[]): Promise<ResponsesQuestionFilesUploadResponse> => {
	const formData = new FormData();
	files.forEach(f => formData.append("files", f));
	const res = await responsesUploadQuestionFiles(responseId, questionId, { files } as import("@nycu-sdc/core-system-sdk").ResponsesQuestionFilesUploadRequest, defaultRequestOptions);
	assertOk(res.status, "Failed to upload files");
	return res.data;
};
