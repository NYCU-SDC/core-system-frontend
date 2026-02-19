import type { SlugGetSlugHistory200, SlugStatus, UnitOrgMemberRequest, UnitOrganization, UnitUpdateOrgRequest } from "@nycu-sdc/core-system-sdk";
import {
	slugGetSlugHistory,
	slugGetSlugStatus,
	unitAddOrgMember,
	unitGetOrgById,
	unitListOrgMembers,
	unitListOrganizationsOfCurrentUser,
	unitRemoveOrgMember,
	unitUpdateOrg
} from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
};

const getErrorDetail = (payload: unknown): string | null => {
	if (typeof payload === "string") return payload;
	if (!payload || typeof payload !== "object") return null;

	const record = payload as Record<string, unknown>;
	if (typeof record.detail === "string" && record.detail) return record.detail;
	if (typeof record.message === "string" && record.message) return record.message;
	if (typeof record.title === "string" && record.title) return record.title;

	return null;
};

const assertOk = (status: number, message: string, payload?: unknown) => {
	if (status < 200 || status >= 300) {
		const detail = getErrorDetail(payload);
		throw new Error(detail ? `${message}: ${detail}` : `${message} (status ${status})`);
	}
};

export const getOrg = async (slug: string): Promise<UnitOrganization> => {
	const res = await unitGetOrgById(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to load organization", res.data);
	return res.data;
};

export const listOrgMembers = async (slug: string) => {
	const res = await unitListOrgMembers(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to load members", res.data);
	return res.data;
};

export const updateOrg = async (slug: string, req: UnitUpdateOrgRequest) => {
	const res = await unitUpdateOrg(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to update organization", res.data);
	return res.data;
};

export const addOrgMember = async (slug: string, req: UnitOrgMemberRequest) => {
	const res = await unitAddOrgMember(slug, req, defaultRequestOptions);
	assertOk(res.status, "Failed to add member", res.data);
	return res.data;
};

export const removeOrgMember = async (slug: string, memberId: string): Promise<void> => {
	const res = await unitRemoveOrgMember(slug, memberId, defaultRequestOptions);
	assertOk(res.status, "Failed to remove member", res.data);
};

export const listMyOrgs = async (): Promise<UnitOrganization[]> => {
	const res = await unitListOrganizationsOfCurrentUser(defaultRequestOptions);
	assertOk(res.status, "Failed to load my organizations", res.data);
	return res.data;
};

export const getSlugStatus = async (slug: string): Promise<SlugStatus> => {
	const res = await slugGetSlugStatus(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to get slug status", res.data);
	return res.data as SlugStatus;
};

export const getSlugHistory = async (slug: string): Promise<SlugGetSlugHistory200> => {
	const res = await slugGetSlugHistory(slug, defaultRequestOptions);
	assertOk(res.status, "Failed to get slug history", res.data);
	return res.data as SlugGetSlugHistory200;
};
