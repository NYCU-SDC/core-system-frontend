import { UserLayout } from "@/layouts";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import styles from "./CallbackPage.module.css";

function getSafeRedirectTarget(): string | null {
	const params = new URLSearchParams(window.location.search);
	const raw = params.get("r") ?? params.get("redirect") ?? params.get("redirectUrl");
	if (!raw) return null;

	// Accept either absolute same-origin URL or a leading-slash path.
	if (raw.startsWith("/")) return raw;
	try {
		const url = new URL(raw);
		if (url.origin !== window.location.origin) return null;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return null;
	}
}

export const CallbackPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	useEffect(() => {
		const processCallback = async () => {
			try {
				const user = await authService.getCurrentUser();
				queryClient.setQueryData(["auth", "user"], user);
				const redirectTarget = getSafeRedirectTarget();
				if (user) {
					navigate(redirectTarget ?? "/forms", { replace: true });
					return;
				}
				navigate("/", { replace: true });
			} catch {
				navigate("/", { replace: true });
			}
		};

		processCallback();
	}, [navigate, queryClient]);

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.spinner} />
				<p className={styles.message}>Authenticating...</p>
			</div>
		</UserLayout>
	);
};
