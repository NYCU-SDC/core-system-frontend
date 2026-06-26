import { assertOk } from "@/shared/utils/apiError";
import type {
	FormWorkflowCreateNodeRequest,
	FormWorkflowGetWorkflowResponse,
	FormWorkflowNodeRequest,
	FormWorkflowNodeResponse,
	FormWorkflowNodeStructure,
	FormsFont,
	FormsFormCoverUploadResponse,
	FormsFormPublishResponse,
	FormsFormRequest,
	FormsFormRequestUpdate,
	FormsFormResponse,
	FormsFormStatus,
	FormsGoogleSheetEmailResponse,
	FormsGoogleSheetVerifyRequest,
	FormsGoogleSheetVerifyResponse,
	FormsHighlightPatchRequest,
	FormsHighlightRequest,
	FormsHighlightResponse,
	FormsQuestionRequest,
	FormsQuestionResponse,
	FormsSection,
	FormsSectionBundle,
	FormsSectionRequest,
	ResponsesAnswersRequest,
	ResponsesAnswersRequestUpdate,
	ResponsesCreateResponse,
	ResponsesExportPreviewRequest,
	ResponsesExportPreviewResponse,
	ResponsesGetFormResponse,
	ResponsesGetQuestionResponse,
	ResponsesListResponse,
	ResponsesQuestionFilesUploadResponse,
	UnitUserForm
} from "@nycu-sdc/core-system-sdk";
import {
	filesDownloadFile,
	formWorkflowCreateNode,
	formWorkflowDeleteNode,
	formWorkflowGetWorkflow,
	formWorkflowUpdateWorkflow,
	formsArchiveForm,
	formsClearFormHighlight,
	formsCreateQuestion,
	formsDeleteForm,
	formsDeleteQuestion,
	formsGetFormById,
	formsGetFormFonts,
	formsGetFormHighlight,
	formsGetGoogleSheetEmail,
	formsListSections,
	formsPublishForm,
	formsSetFormHighlight,
	formsUnarchiveForm,
	formsUpdateForm,
	formsUpdateFormHighlight,
	formsUpdateQuestion,
	formsUpdateSection,
	formsUploadFormCoverImage,
	formsVerifyGoogleSheet,
	responsesCreateFormResponse,
	responsesDeleteFormResponse,
	responsesGetFormResponse,
	responsesGetQuestionResponse,
	responsesListFormResponses,
	responsesPreviewFormResponseExport,
	responsesSubmitFormResponse,
	responsesUpdateFormResponse,
	unitCreateOrgForm,
	unitListFormsByOrg,
	unitListFormsOfCurrentUser
} from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

// ── Forms ──────────────────────────────────────────────────────────────────

const MOCK_EMPTY_SECTION_ID = "c34d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f";

const emptyQuestionDescription: FormsQuestionResponse["description"] = {
	type: "doc",
	content: [
		{
			type: "paragraph",
			content: []
		}
	]
};

const withMockSectionQuestions = (sections: FormsSectionBundle[]): FormsSectionBundle[] => {
	if (!import.meta.env.DEV) return sections;

	return sections.map(bundle => {
		if (bundle.section.id !== MOCK_EMPTY_SECTION_ID || bundle.questions !== null) return bundle;

		const now = "2025-02-01T15:30:00Z";
		const sectionId = bundle.section.id;

		return {
			...bundle,
			questions: [
				{
					id: "11111111-1111-4111-8111-111111111111",
					sectionId,
					required: false,
					type: "SINGLE_CHOICE",
					title: "Q1 請選一個組別",
					description: emptyQuestionDescription,
					descriptionHtml: "<p></p>",
					choices: [
						{ id: "11111111-1111-4111-8111-111111111101", name: "Full Stack" },
						{ id: "11111111-1111-4111-8111-111111111102", name: "Backend" },
						{ id: "11111111-1111-4111-8111-111111111103", name: "Frontend" }
					],
					createdAt: now,
					updatedAt: now
				},
				{
					id: "22222222-2222-4222-8222-222222222222",
					sectionId,
					required: false,
					type: "MULTIPLE_CHOICE",
					title: "Q2 請選多個組別",
					description: emptyQuestionDescription,
					descriptionHtml: "<p></p>",
					choices: [
						{ id: "22222222-2222-4222-8222-222222222201", name: "Full Stack" },
						{ id: "22222222-2222-4222-8222-222222222202", name: "Backend" },
						{ id: "22222222-2222-4222-8222-222222222203", name: "Frontend" },
						{ id: "22222222-2222-4222-8222-222222222204", name: "Data" }
					],
					createdAt: now,
					updatedAt: now
				},
				{
					id: "33333333-3333-4333-8333-333333333333",
					sectionId,
					required: false,
					type: "DROPDOWN",
					title: "Q3 請選一個組別（選單）",
					description: emptyQuestionDescription,
					descriptionHtml: "<p></p>",
					choices: [
						{ id: "33333333-3333-4333-8333-333333333301", name: "Full Stack" },
						{ id: "33333333-3333-4333-8333-333333333302", name: "Backend" },
						{ id: "33333333-3333-4333-8333-333333333303", name: "Frontend" }
					],
					createdAt: now,
					updatedAt: now
				},
				{
					id: "44444444-4444-4444-8444-444444444444",
					sectionId,
					required: false,
					type: "DETAILED_MULTIPLE_CHOICE",
					title: "Q4 請選多個組別（詳細多選）",
					description: emptyQuestionDescription,
					descriptionHtml: "<p></p>",
					choices: [
						{ id: "44444444-4444-4444-8444-444444444401", name: "Full Stack", description: "前後端整合開發" },
						{ id: "44444444-4444-4444-8444-444444444402", name: "Backend", description: "API 與資料服務" },
						{ id: "44444444-4444-4444-8444-444444444403", name: "Frontend", description: "使用者介面開發" }
					],
					createdAt: now,
					updatedAt: now
				}
			]
		};
	});
};

export const listOrgForms = async (slug: string): Promise<FormsFormResponse[]> => {
	const res = await unitListFormsByOrg(slug, undefined, defaultRequestOptions);
	assertOk(res.status, "Failed to load forms", res.data);
	return res.data;
};

export const listOrgFormsByStatus = async (slug: string, statuses?: readonly FormsFormStatus[]): Promise<FormsFormResponse[]> => {
	const params = statuses && statuses.length > 0 ? { status: [...statuses] } : undefined;
	const res = await unitListFormsByOrg(slug, params, defaultRequestOptions);
	assertOk(res.status, "Failed to load forms", res.data);
	return res.data;
};

export const createOrgForm = async (slug: string, req: FormsFormRequest): Promise<FormsFormResponse> => {
	const res = await unitCreateOrgForm(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create form", res.data);
	return res.data;
};

export const getFormById = async (formId: string): Promise<FormsFormResponse> => {
	const res = await formsGetFormById(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load form", res.data);
	return res.data;
};

export const updateForm = async (formId: string, req: FormsFormRequestUpdate): Promise<FormsFormResponse> => {
	const res = await formsUpdateForm(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update form", res.data);
	return res.data;
};

export const publishForm = async (formId: string): Promise<FormsFormPublishResponse> => {
	const res = await formsPublishForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to publish form", res.data);
	return res.data;
};

export const archiveForm = async (formId: string): Promise<FormsFormResponse> => {
	const res = await formsArchiveForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to archive form", res.data);
	return res.data;
};

export const unarchiveForm = async (formId: string): Promise<FormsFormResponse> => {
	const res = await formsUnarchiveForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to unarchive form", res.data);
	return res.data;
};

export const deleteForm = async (formId: string): Promise<void> => {
	const res = await formsDeleteForm(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete form", res.data);
};

export const uploadFormCoverImage = async (formId: string, file: File): Promise<FormsFormCoverUploadResponse> => {
	const res = await formsUploadFormCoverImage(formId, { coverImage: file }, defaultRequestOptions);
	assertOk(res.status, "Failed to upload cover image", res.data);
	return res.data;
};

export const getFormFonts = async (): Promise<FormsFont[]> => {
	const res = await formsGetFormFonts(defaultRequestOptions);
	assertOk(res.status, "Failed to load fonts", res.data);
	return res.data;
};

export const getFormHighlight = async (formId: string): Promise<FormsHighlightResponse> => {
	const res = await formsGetFormHighlight(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load form highlight", res.data);
	return res.data as FormsHighlightResponse;
};

export const setFormHighlight = async (formId: string, req: FormsHighlightRequest): Promise<FormsHighlightResponse> => {
	const res = await formsSetFormHighlight(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to save form highlight", res.data);
	return res.data as FormsHighlightResponse;
};

export const updateFormHighlight = async (formId: string, req: FormsHighlightPatchRequest): Promise<FormsHighlightResponse> => {
	const res = await formsUpdateFormHighlight(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update form highlight", res.data);
	return res.data as FormsHighlightResponse;
};

export const clearFormHighlight = async (formId: string): Promise<void> => {
	const res = await formsClearFormHighlight(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to clear form highlight", res.data);
};

// ── Sections & Questions ──────────────────────────────────────────────────

export const listSections = async (formId: string): Promise<FormsSectionBundle[]> => {
	const res = await formsListSections(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load sections", res.data);

	return withMockSectionQuestions(res.data);
};

export const updateSection = async (formId: string, sectionId: string, req: FormsSectionRequest): Promise<FormsSection> => {
	const res = await formsUpdateSection(formId, sectionId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update section", res.data);
	return res.data;
};

export const createQuestion = async (sectionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await formsCreateQuestion(sectionId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create question", res.data);
	return res.data;
};

export const updateQuestion = async (sectionId: string, questionId: string, req: FormsQuestionRequest): Promise<FormsQuestionResponse> => {
	const res = await formsUpdateQuestion(sectionId, questionId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update question", res.data);
	return res.data;
};

export const deleteQuestion = async (sectionId: string, questionId: string): Promise<void> => {
	const res = await formsDeleteQuestion(sectionId, questionId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete question", res.data);
};

// ── Workflow ──────────────────────────────────────────────────────────────

export const getWorkflow = async (formId: string): Promise<FormWorkflowGetWorkflowResponse> => {
	const res = await formWorkflowGetWorkflow(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load workflow", res.data);
	return res.data as FormWorkflowGetWorkflowResponse;
};

export const updateWorkflow = async (formId: string, nodes: FormWorkflowNodeRequest[]): Promise<FormWorkflowNodeResponse[]> => {
	const res = await formWorkflowUpdateWorkflow(formId, nodes, defaultRequestOptions);
	assertOk(res.status, "Failed to update workflow", res.data);
	return res.data as FormWorkflowNodeResponse[];
};

export const createWorkflowNode = async (formId: string, req: FormWorkflowCreateNodeRequest): Promise<FormWorkflowNodeStructure> => {
	const res = await formWorkflowCreateNode(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to create workflow node", res.data);
	return res.data as FormWorkflowNodeStructure;
};

export const deleteWorkflowNode = async (formId: string, nodeId: string): Promise<void> => {
	const res = await formWorkflowDeleteNode(formId, nodeId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete workflow node", res.data);
};

// ── User Forms ────────────────────────────────────────────────────────────

export const listMyForms = async (): Promise<UnitUserForm[]> => {
	const res = await unitListFormsOfCurrentUser(defaultRequestOptions);
	assertOk(res.status, "Failed to load my forms", res.data);
	if (res.status !== 200) {
		throw new Error("Failed to load my forms");
	}
	return res.data;
};

// ── Responses ─────────────────────────────────────────────────────────────

export const createFormResponse = async (formId: string): Promise<ResponsesCreateResponse> => {
	const res = await responsesCreateFormResponse(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to start form", res.data);
	return res.data as ResponsesCreateResponse;
};

export const listFormResponses = async (formId: string): Promise<ResponsesListResponse> => {
	const res = await responsesListFormResponses(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to load responses", res.data);
	return res.data as ResponsesListResponse;
};

export const getFormResponse = async (formId: string, responseId: string): Promise<ResponsesGetFormResponse> => {
	const res = await responsesGetFormResponse(formId, responseId, defaultRequestOptions);
	assertOk(res.status, "Failed to load response", res.data);
	return res.data as ResponsesGetFormResponse;
};

export const previewFormResponseExport = async (formId: string, req: ResponsesExportPreviewRequest): Promise<ResponsesExportPreviewResponse> => {
	const res = await responsesPreviewFormResponseExport(formId, req, defaultRequestOptions);
	assertOk(res.status, "Failed to preview export", res.data);
	return res.data as ResponsesExportPreviewResponse;
};

const parseDownloadFilename = (contentDisposition: string | null): string | null => {
	if (!contentDisposition) return null;

	const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match?.[1]) {
		return decodeURIComponent(utf8Match[1]);
	}

	const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
	return basicMatch?.[1] ?? null;
};

export const exportFormResponses = async (formId: string, questionIds: string[]): Promise<{ blob: Blob; filename: string | null }> => {
	const response = await fetch(`/api/forms/${formId}/responses/export/download`, {
		...defaultRequestOptions,
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ questionIds })
	});

	if (!response.ok) {
		const body = await response.text();
		let payload: unknown = body;
		try {
			payload = JSON.parse(body);
		} catch {
			payload = body;
		}
		assertOk(response.status, "Failed to export responses", payload);
	}

	return {
		blob: await response.blob(),
		filename: parseDownloadFilename(response.headers.get("Content-Disposition"))
	};
};

export const deleteFormResponse = async (formId: string, responseId: string): Promise<void> => {
	const res = await responsesDeleteFormResponse(formId, responseId, defaultRequestOptions);
	assertOk(res.status, "Failed to delete response", res.data);
};

export const updateFormResponse = async (responseId: string, answers: ResponsesAnswersRequestUpdate): Promise<void> => {
	const res = await responsesUpdateFormResponse(responseId, answers, defaultRequestOptions);
	assertOk(res.status, "Failed to save answers", res.data);
};

export const submitFormResponse = async (responseId: string, answers: ResponsesAnswersRequest): Promise<void> => {
	const res = await responsesSubmitFormResponse(responseId, answers, defaultRequestOptions);
	assertOk(res.status, "Failed to submit form", res.data);
};

export const cancelFormResponseSubmission = async (responseId: string): Promise<void> => {
	const response = await fetch(`/api/responses/${responseId}/cancel`, {
		...defaultRequestOptions,
		method: "POST"
	});
	const body = [204, 205, 304].includes(response.status) ? "" : await response.text();
	const data = body.trim().length > 0 ? JSON.parse(body) : {};
	assertOk(response.status, "Failed to cancel submission", data);
};

export const downloadFile = async (fileId: string): Promise<Blob> => {
	const res = await filesDownloadFile(fileId, defaultRequestOptions);
	assertOk(res.status, "Failed to download file", res.data);
	return res.data as Blob;
};

export const clearQuestionFiles = async (responseId: string, questionId: string): Promise<void> => {
	const response = await fetch(`/api/responses/${responseId}/questions/${questionId}/files`, {
		...defaultRequestOptions,
		method: "DELETE"
	});
	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to clear files: HTTP ${response.status}`);
	}
};

export const uploadQuestionFiles = async (responseId: string, questionId: string, files: File[]): Promise<ResponsesQuestionFilesUploadResponse> => {
	const res = await (async () => {
		const formData = new FormData();
		files.forEach(file => formData.append("files", file));
		const response = await fetch(`/api/responses/${responseId}/questions/${questionId}/files`, {
			...defaultRequestOptions,
			method: "POST",
			body: formData
		});
		const body = [204, 205, 304].includes(response.status) ? null : await response.text();
		const data = body ? JSON.parse(body) : {};
		return { data, status: response.status, headers: response.headers };
	})();
	assertOk(res.status, "Failed to upload files", res.data);
	return res.data as ResponsesQuestionFilesUploadResponse;
};

export const getQuestionResponse = async (responseId: string, questionId: string): Promise<ResponsesGetQuestionResponse> => {
	const res = await responsesGetQuestionResponse(responseId, questionId, defaultRequestOptions);
	assertOk(res.status, "Failed to get question response", res.data);
	return res.data as ResponsesGetQuestionResponse;
};

export const getConnectOauthAccountUrl = (responseId: string, questionId: string, redirectUrl?: string): string => {
	const base = `/api/responses/${responseId}/questions/${questionId}/oauth`;
	if (redirectUrl) {
		return `${base}?r=${encodeURIComponent(redirectUrl)}`;
	}
	return base;
};

// ── Google Sheet ──────────────────────────────────────────────────────────

export const getGoogleSheetEmail = async (): Promise<FormsGoogleSheetEmailResponse> => {
	const res = await formsGetGoogleSheetEmail(defaultRequestOptions);
	assertOk(res.status, "Failed to load Google Sheet email", res.data);
	return res.data;
};

export const verifyGoogleSheet = async (req: FormsGoogleSheetVerifyRequest): Promise<FormsGoogleSheetVerifyResponse> => {
	const res = await formsVerifyGoogleSheet(req, defaultRequestOptions);
	assertOk(res.status, "Failed to verify Google Sheet", res.data);
	return res.data;
};
