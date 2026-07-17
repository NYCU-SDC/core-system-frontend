import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { useParams } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useOrgAdminAccess = () => {
	const { user, isLoading: isAuthLoading } = useAuth();
	const { orgId, orgSlug } = useParams<{ orgId?: string; orgSlug?: string }>();
	const myOrgsQuery = useMyOrgs();

	const isLoading = isAuthLoading || myOrgsQuery.isLoading;
	const requestedOrg = orgSlug ?? orgId;
	const canAccessRequestedOrg = !requestedOrg || !!myOrgsQuery.data?.some(org => org.slug === requestedOrg || org.id === requestedOrg);
	const canAccessOrgAdmin = !!user && !!myOrgsQuery.data?.length && canAccessRequestedOrg;

	return {
		user,
		canAccessOrgAdmin,
		isLoading
	};
};
