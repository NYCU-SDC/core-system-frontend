import { useAuth, useAuthRefreshInterval } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const RequireLogin = () => {
	const { isAuthenticated, isLoading } = useAuth();

	useAuthRefreshInterval();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default RequireLogin;
