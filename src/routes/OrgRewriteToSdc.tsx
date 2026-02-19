import { useMyOrgs } from "@/features/dashboard/hooks/useOrgSettings";
import { Navigate, useLocation, useParams } from "react-router-dom";

const OrgRewriteToSdc = () => {
	const { orgId } = useParams();
	const location = useLocation();
	const myOrgsQuery = useMyOrgs();

	if (myOrgsQuery.isLoading) return null;

	const targetSlug = myOrgsQuery.data?.[0]?.slug ?? "SDC";

	// Only redirect if the orgId in the URL is different from the target slug
	if (orgId === targetSlug) return null;

	const newPath = location.pathname.replace(`/orgs/${orgId}`, `/orgs/${targetSlug}`);
	return <Navigate to={newPath} replace />;
};
export default OrgRewriteToSdc;
