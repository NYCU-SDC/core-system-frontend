import { useAuthRefreshInterval } from "@/features/auth/hooks/useAuth";
import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { Outlet } from "react-router-dom";
import CrossEntryRedirect from "./CrossEntryRedirect";

const RequireOrgAdminAccess = () => {
	const { user, canAccessOrgAdmin, isLoading } = useOrgAdminAccess();

	useAuthRefreshInterval();

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
