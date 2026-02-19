import { useAuth } from "@/features/auth/hooks/useAuth";
import { Outlet } from "react-router-dom";
import CrossEntryRedirect from "./CrossEntryRedirect";

const RequireLogin = () => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <CrossEntryRedirect to="/" />;
	}

	return <Outlet />;
};

export default RequireLogin;
