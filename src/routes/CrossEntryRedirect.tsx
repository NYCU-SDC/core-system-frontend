import { useEffect } from "react";

type CrossEntryRedirectProps = {
	to: string;
};

const CrossEntryRedirect = ({ to }: CrossEntryRedirectProps) => {
	useEffect(() => {
		window.location.replace(to);
	}, [to]);

	return null;
};

/**
 * Forces a full page reload to the current URL so the server can serve the
 * correct HTML entry point (admin.html vs forms.html) for the active path.
 * Use this in routes that cross MPA entry boundaries.
 */
export const CrossEntryCurrentRedirect = () => {
	useEffect(() => {
		window.location.replace(window.location.pathname + window.location.search + window.location.hash);
	}, []);

	return null;
};

export default CrossEntryRedirect;
