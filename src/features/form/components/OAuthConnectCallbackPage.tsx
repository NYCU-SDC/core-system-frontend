import { useEffect } from "react";
import styles from "./OAuthConnectCallbackPage.module.css";

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

	return <p className={styles.message}>綁定完成，視窗將自動關閉…</p>;
};
