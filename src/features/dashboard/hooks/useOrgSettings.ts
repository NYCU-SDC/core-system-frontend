import * as api from "@/features/dashboard/services/api";
import { orgKeys } from "@/shared/queryKeys/org";
import type { UnitOrganization, UnitOrgMemberRequest, UnitOrgMemberResponse, UnitUpdateOrgRequest } from "@nycu-sdc/core-system-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ---------- Queries ---------- */

export const useOrg = (slug: string) =>
	useQuery({
		queryKey: orgKeys.bySlug(slug),
		queryFn: () => api.getOrg(slug)
	});

export const useOrgMembers = (slug: string) =>
	useQuery({
		queryKey: orgKeys.members(slug),
		queryFn: () => api.listOrgMembers(slug)
	});

/* ---------- Mutations ---------- */

export const useUpdateOrg = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<UnitOrganization, Error, UnitUpdateOrgRequest>({
		mutationFn: req => api.updateOrg(slug, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.bySlug(slug) })
	});
};

export const useAddOrgMember = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<UnitOrgMemberResponse, Error, UnitOrgMemberRequest>({
		mutationFn: req => api.addOrgMember(slug, req),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.members(slug) })
	});
};

export const useRemoveOrgMember = (slug: string) => {
	const qc = useQueryClient();

	return useMutation<
		void, // TData（如果 API 不回東西）
		Error,
		string // TVariables = memberId
	>({
		mutationFn: id => api.removeOrgMember(slug, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.members(slug) })
	});
};
