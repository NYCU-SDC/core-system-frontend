import type { FormsForm, FormsFormRequest, ResponsesCreateResponse, UnitOrgMemberRequest, UnitOrganization, UnitUpdateOrgRequest, UnitUserForm } from "@nycu-sdc/core-system-sdk";
import {
	responsesCreateFormResponse,
	unitAddOrgMember,
	unitCreateOrgForm,
	unitGetOrgById,
	unitListFormsByOrg,
	unitListFormsOfCurrentUser,
	unitListOrgMembers,
	unitRemoveOrgMember,
	unitUpdateOrg
} from "@nycu-sdc/core-system-sdk";

const accessToken =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6ImNjYThjZGJhLWYxZDAtNDVjYS1iYTQxLTAzM2M2MWU5Nzc4MyIsIlVzZXJuYW1lIjoiZXRoZWxoc2lhbzA2MTYiLCJOYW1lIjoiRXRoZWwgSHNpYW8iLCJBdmF0YXJVcmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLc0dxSjFfcGo1Sy1zZVRwZ3FJdkdfcVJSbGE5WGo5bkFudUVkYnBRWDBoYzVEakVOMT1zOTYtYyIsIlJvbGUiOlsidXNlciJdLCJpc3MiOiJjb3JlLXN5c3RlbSIsInN1YiI6Ijc2ZmI1ZTVmLWYwMGItNGU1NC1iOGQ2LWI5YmQwM2IxNjYxOCIsImV4cCI6MTc3MDIyMzY0MSwibmJmIjoxNzcwMjIyNzQxLCJpYXQiOjE3NzAyMjI3NDEsImp0aSI6ImNjYThjZGJhLWYxZDAtNDVjYS1iYTQxLTAzM2M2MWU5Nzc4MyJ9.hlyyFsrCOHk1wC3dpZw9f8veJJEzXf2uukgnZ0IeD5k";
const defaultRequestOptions: RequestInit = {
	credentials: "include",
	headers: {
		Authorization: `Bearer ${accessToken}`
	}
};

const assertOk = (status: number, message: string) => {
	if (status < 200 || status >= 300) {
		throw new Error(`${message} (status ${status})`);
	}
};

export const getOrg = async (slug: string): Promise<UnitOrganization> => {
	const res = await unitGetOrgById(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to load organization");
	return res.data;
};

export const listOrgMembers = async (slug: string) => {
	const res = await unitListOrgMembers(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to load members");
	return res.data;
};

export const updateOrg = async (slug: string, req: UnitUpdateOrgRequest) => {
	const res = await unitUpdateOrg(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update organization");
	return res.data;
};

export const addOrgMember = async (slug: string, req: UnitOrgMemberRequest) => {
	const res = await unitAddOrgMember(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to add member");
	return res.data;
};

export const removeOrgMember = async (slug: string, memberId: string): Promise<void> => {
	const res = await unitRemoveOrgMember(slug, memberId, defaultRequestOptions);
	assertOk(res.status, "Failed to remove member");
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

export const listMyForms = async (): Promise<UnitUserForm[]> => {
	const res = await unitListFormsOfCurrentUser(defaultRequestOptions);
	assertOk(res.status, "Failed to load my forms");
	return res.data;
};

export const createFormResponse = async (formId: string): Promise<ResponsesCreateResponse> => {
	const res = await responsesCreateFormResponse(formId, defaultRequestOptions);
	assertOk(res.status, "Failed to start form");
	return res.data;
};
