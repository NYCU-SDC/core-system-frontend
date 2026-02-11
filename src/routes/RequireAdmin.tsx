import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAdmin = () => {
	const { isAdmin, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return null;
	}

	if (!isAdmin) {
		return <Navigate to="/forms" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
};

export default RequireAdmin;
