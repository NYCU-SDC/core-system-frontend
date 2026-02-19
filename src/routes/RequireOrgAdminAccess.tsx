import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { Outlet } from "react-router-dom";
import CrossEntryRedirect from "./CrossEntryRedirect";

const RequireOrgAdminAccess = () => {
	const { user, canAccessOrgAdmin, isLoading } = useOrgAdminAccess();

	if (isLoading) {
		return null;
	}

	if (!user) {
		return <CrossEntryRedirect to="/" />;
	}

	if (!canAccessOrgAdmin) {
		return <CrossEntryRedirect to="/forms" />;
	}

	return <Outlet />;
};

export default RequireOrgAdminAccess;
