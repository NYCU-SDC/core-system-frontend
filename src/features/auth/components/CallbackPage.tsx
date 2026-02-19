import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, canAccessWelcome, type AuthUser } from "../services/authService";
import styles from "./CallbackPage.module.css";

function getSafeRedirectTarget(): string | null {
	const params = new URLSearchParams(window.location.search);
	const raw = params.get("r") ?? params.get("redirect") ?? params.get("redirectUrl");

	if (!raw) return null;

	if (raw.startsWith("/")) return raw;
	try {
		const url = new URL(raw);
		if (url.origin !== window.location.origin) return null;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return null;
	}
}

function getRefreshTokenFromUrl(): string | null {
	const params = new URLSearchParams(window.location.search);
	return params.get("refreshToken") ?? params.get("rt");
}

export const CallbackPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const meta = useSeo({ rule: SEO_CONFIG.callback });

	useEffect(() => {
		const processCallback = async () => {
			const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

			try {
				const refreshToken = getRefreshTokenFromUrl();
				if (refreshToken) {
					authService.setStoredRefreshToken(refreshToken);
				}

				let user: AuthUser | null = null;

				for (let attempt = 0; attempt < 3; attempt += 1) {
					user = await authService.getCurrentUser<AuthUser>();
					if (user) {
						break;
					}
					await wait(300);
				}

				queryClient.setQueryData(["user", "me"], user);
				const redirectTarget = getSafeRedirectTarget();

				if (user) {
					if (canAccessWelcome(user)) {
						navigate("/welcome", { replace: true });
						return;
					}
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
			{meta}
			<div className={styles.container}>
				<div className={styles.spinner} />
				<p className={styles.message}>Authenticating...</p>
			</div>
		</UserLayout>
	);
};
