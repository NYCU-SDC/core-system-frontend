import type { UnitOrgMemberRequest, UnitOrganization, UnitUpdateOrgRequest } from "@nycu-sdc/core-system-sdk";
import { unitAddOrgMember, unitGetOrgById, unitListOrgMembers, unitRemoveOrgMember, unitUpdateOrg } from "@nycu-sdc/core-system-sdk";

const defaultRequestOptions: RequestInit = {
	credentials: "include"
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
