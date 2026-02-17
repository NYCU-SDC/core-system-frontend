import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireOrgAdminAccess = () => {
	const { canAccessOrgAdmin, isLoading } = useOrgAdminAccess();
	const location = useLocation();

	if (isLoading) {
		return null;
	}

	if (!canAccessOrgAdmin) {
		return <Navigate to="/forms" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
};

export default RequireOrgAdminAccess;
