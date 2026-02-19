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

export default CrossEntryRedirect;
