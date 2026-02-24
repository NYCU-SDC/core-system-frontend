import { useAuth, useAuthRefreshInterval } from "@/features/auth/hooks/useAuth";
import { Outlet } from "react-router-dom";
import CrossEntryRedirect from "./CrossEntryRedirect";

const RequireLogin = () => {
	const { isAuthenticated, isLoading } = useAuth();

	useAuthRefreshInterval();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <CrossEntryRedirect to="/" />;
	}

	return <Outlet />;
};

export default RequireLogin;
