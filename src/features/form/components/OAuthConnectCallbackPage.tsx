import { useEffect } from "react";

const buildParamsObject = (searchParams: URLSearchParams) => {
	const params: Record<string, string> = {};
	searchParams.forEach((value, key) => {
		params[key] = value;
	});
	return params;
};

export const OAuthConnectCallbackPage = () => {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const questionId = params.get("questionId") ?? "";
		const responseId = params.get("responseId") ?? "";

		if (window.opener && !window.opener.closed) {
			window.opener.postMessage(
				{
					type: "FORM_OAUTH_CONNECTED",
					questionId,
					responseId,
					params: buildParamsObject(params)
				},
				window.location.origin
			);
		}

		window.close();
	}, []);

	return <p style={{ padding: "1rem" }}>綁定完成，視窗將自動關閉…</p>;
};
