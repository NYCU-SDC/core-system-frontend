import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { Navigate, Outlet } from "react-router-dom";

const RequireOrgAdminAccess = () => {
	const { user, canAccessOrgAdmin, isLoading } = useOrgAdminAccess();

	if (isLoading) {
		return null;
	}

	if (!user) {
		return <Navigate to="/" replace />;
	}

	if (!canAccessOrgAdmin) {
		return <Navigate to="/forms" replace />;
	}

	return <Outlet />;
};

export default RequireOrgAdminAccess;
