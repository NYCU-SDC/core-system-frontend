import type { FormsForm, FormsFormRequest, FormsFormRequestUpdate, ResponsesCreateResponse, UnitUserForm } from "@nycu-sdc/core-system-sdk";
import { formsGetFormById, formsUpdateForm, responsesCreateFormResponse, unitCreateOrgForm, unitListFormsByOrg, unitListFormsOfCurrentUser } from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const assertOk = (status: number, message: string) => {
	if (status < 200 || status >= 300) {
		throw new Error(`${message} (status ${status})`);
	}
};

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

export const listMyForms = async (): Promise<UnitUserForm[]> => {
	const res = await unitListFormsOfCurrentUser(defaultRequestOptions);
	assertOk(res.status, "Failed to load my forms");
	return res.data;
};

export const createFormResponse = async (formId: string): Promise<ResponsesCreateResponse> => {
	const res = await responsesCreateFormResponse(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to start form");
	return res.data as ResponsesCreateResponse;
};
