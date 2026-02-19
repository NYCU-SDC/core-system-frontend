import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { Outlet } from "react-router-dom";
import CrossEntryRedirect from "./CrossEntryRedirect";

const RequireOrgAdminAccess = () => {
	const { canAccessOrgAdmin, isLoading } = useOrgAdminAccess();

	if (isLoading) {
		return null;
	}

	if (!canAccessOrgAdmin) {
		return <CrossEntryRedirect to="/forms" />;
	}

	return <Outlet />;
};

export default RequireOrgAdminAccess;
