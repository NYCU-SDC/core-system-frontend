import { Navigate, useLocation, useParams } from "react-router-dom";

const OrgRewriteToSdc = () => {
	const { orgId } = useParams();
	const location = useLocation();

	// 把 `/orgs/{orgId}` 換成 `/orgs/sdc`
	const newPath = location.pathname.replace(`/orgs/${orgId}`, `/orgs/sdc`);

	return <Navigate to={newPath} replace />;
};
export default OrgRewriteToSdc;
