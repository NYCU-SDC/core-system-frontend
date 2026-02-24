import { withAuthRefreshRetry } from "@/features/auth/services/authService";
import { assertOk } from "@/shared/utils/apiError";
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

export const getOrg = async (slug: string): Promise<UnitOrganization> => {
	const res = await withAuthRefreshRetry(() => unitGetOrgById(slug, defaultRequestOptions));
	assertOk(res.status, "Failed to load organization", res.data);
	return res.data;
};

export const listOrgMembers = async (slug: string) => {
	const res = await withAuthRefreshRetry(() => unitListOrgMembers(slug, defaultRequestOptions));
	assertOk(res.status, "Failed to load members", res.data);
	return res.data;
};

export const updateOrg = async (slug: string, req: UnitUpdateOrgRequest) => {
	const res = await withAuthRefreshRetry(() => unitUpdateOrg(slug, req, defaultRequestOptions));
	assertOk(res.status, "Failed to update organization", res.data);
	return res.data;
};

export const addOrgMember = async (slug: string, req: UnitOrgMemberRequest) => {
	const res = await withAuthRefreshRetry(() => unitAddOrgMember(slug, req, defaultRequestOptions));
	assertOk(res.status, "Failed to add member", res.data);
	return res.data;
};

export const removeOrgMember = async (slug: string, memberId: string): Promise<void> => {
	const res = await withAuthRefreshRetry(() => unitRemoveOrgMember(slug, memberId, defaultRequestOptions));
	assertOk(res.status, "Failed to remove member", res.data);
};

export const listMyOrgs = async (): Promise<UnitOrganization[]> => {
	const res = await withAuthRefreshRetry(() => unitListOrganizationsOfCurrentUser(defaultRequestOptions));
	assertOk(res.status, "Failed to load my organizations", res.data);
	return res.data;
};

export const getSlugStatus = async (slug: string): Promise<SlugStatus> => {
	const res = await withAuthRefreshRetry(() => slugGetSlugStatus(slug, defaultRequestOptions));
	assertOk(res.status, "Failed to get slug status", res.data);
	return res.data as SlugStatus;
};

export const getSlugHistory = async (slug: string): Promise<SlugGetSlugHistory200> => {
	const res = await withAuthRefreshRetry(() => slugGetSlugHistory(slug, defaultRequestOptions));
	assertOk(res.status, "Failed to get slug history", res.data);
	return res.data as SlugGetSlugHistory200;
};
