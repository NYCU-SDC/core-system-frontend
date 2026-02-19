import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { useAuth } from "./useAuth";

export const useOrgAdminAccess = () => {
	const { user, isLoading: isAuthLoading } = useAuth();
	const myOrgsQuery = useMyOrgs();

	const isLoading = isAuthLoading || myOrgsQuery.isLoading;
	const canAccessOrgAdmin = !!user && !!myOrgsQuery.data?.length;

	return {
		user,
		canAccessOrgAdmin,
		isLoading
	};
};
