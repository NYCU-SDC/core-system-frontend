import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, useToast } from "@/shared/components";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { ArrowLeftRight, School } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { authService, type OAuthProvider } from "../services/authService";
import { NameMarquee } from "./NameMarquee";
import styles from "./OauthLinkPage.module.css";

const ERROR_REDIRECT_DELAY_MS = 5000;

/** Validates the OAuth provider from the query string. */
const isOAuthProvider = (value: string): value is OAuthProvider => {
	return value === "google" || value === "nycu";
};

/** UI metadata for each provider. */
const providerConfig: Record<
	OAuthProvider,
	{
		label: string;
		icon: ReactNode;
		iconClassName: string;
	}
> = {
	google: {
		label: "GOOGLE",
		icon: <SiGoogle />,
		iconClassName: styles.googleIcon
	},
	nycu: {
		label: "NYCU",
		icon: <School size={30} />,
		iconClassName: styles.portalIcon
	}
};

export const OauthLinkPage = () => {
	const meta = useSeo({ rule: SEO_CONFIG.oauthLink });
	const [searchParams] = useSearchParams();
	const { pushToast } = useToast();

	/** Stores the pending redirect timer id. */
	const redirectTimerRef = useRef<number | null>(null);

	const name = searchParams.get("name") ?? "";
	const email = searchParams.get("email") ?? "";
	const rawProvider = searchParams.get("oauthProvider") ?? "";

	const isSupportedProvider = isOAuthProvider(rawProvider);
	const isInvalidLinkRequest = !name || !email || !isSupportedProvider;

	/** Prevents duplicate requests while submitting. */
	const [isSubmitting, setIsSubmitting] = useState(false);

	/** Redirects home if required params are missing. */
	useEffect(() => {
		if (isInvalidLinkRequest) {
			window.location.href = "/";
		}
	}, [isInvalidLinkRequest]);

	/** Clears the redirect timer on unmount. */
	useEffect(() => {
		return () => {
			if (redirectTimerRef.current !== null) {
				window.clearTimeout(redirectTimerRef.current);
			}
		};
	}, []);

	if (isInvalidLinkRequest) {
		return null;
	}

	/** Resolves the current and target providers. */
	const existingProvider: OAuthProvider = rawProvider;
	const newProvider: OAuthProvider = existingProvider === "google" ? "nycu" : "google";

	/** Schedules a delayed redirect home. */
	const redirectToHomeWithDelay = () => {
		if (redirectTimerRef.current !== null) {
			window.clearTimeout(redirectTimerRef.current);
		}

		redirectTimerRef.current = window.setTimeout(() => {
			window.location.href = "/";
		}, ERROR_REDIRECT_DELAY_MS);
	};

	/** Maps linking errors to toast messages. */
	const getLinkErrorMessage = (error: unknown) => {
		const message = error instanceof Error ? error.message : "";

		if (message.includes("401")) {
			return "?�入?�?�已失�??�逾�?，�??�新?�入?��??��??�中...";
		}

		return "帳�????失�?，�??��??�中...";
	};

	/** Confirms account linking. */
	const handleConfirm = async () => {
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);

			await authService.linkOauthAccount({
				name,
				email,
				oauthProvider: existingProvider
			});

			window.location.href = "/";
		} catch (error) {
			pushToast({
				title: "帳�????失�?",
				description: getLinkErrorMessage(error),
				variant: "error"
			});

			redirectToHomeWithDelay();
		} finally {
			setIsSubmitting(false);
		}
	};

	/** Aborts the linking flow. */
	const handleAbort = async () => {
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);

			await authService.abortLinkOauthAccount();

			window.location.href = "/";
		} catch {
			pushToast({
				title: "?��??��?帳�????",
				description: "請�??��??��??��?返�?首�?�?..",
				variant: "error"
			});

			redirectToHomeWithDelay();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<UserLayout>
			{meta}
			<NameMarquee name={`${name}?`} />

			<div className={styles.content}>
				<div className={styles.text}>
					<h2 className={styles.title}>你是{name}??</h2>
					<p className={styles.description}>
						{`系統?�測?�您??${existingProvider} ?��??�件(${email})?�既?��? ${newProvider} 帳�??��??��?併帳?��?，您將能夠使??${newProvider} ??${existingProvider} 驗�??��??�入，並存�??��??�個人資�??�設定。`}
					</p>
				</div>

				<div className={styles.accountBridge} aria-label="OAuth account connection preview">
					<div className={styles.accountSide}>
						<div className={`${styles.accountIcon} ${providerConfig[existingProvider].iconClassName}`}>{providerConfig[existingProvider].icon}</div>
						<span className={styles.accountLabel}>{providerConfig[existingProvider].label}</span>
					</div>

					<div className={styles.bridgeCenter}>
						<div className={styles.bridgeLine} />
						<div className={styles.bridgeSwap}>
							<ArrowLeftRight size={28} />
						</div>
						<div className={styles.bridgeLine} />
					</div>

					<div className={styles.accountSide}>
						<div className={`${styles.accountIcon} ${providerConfig[newProvider].iconClassName}`}>{providerConfig[newProvider].icon}</div>
						<span className={styles.accountLabel}>{providerConfig[newProvider].label}</span>
					</div>
				</div>

				<div className={styles.actions}>
					<Button type="button" variant="secondary" onClick={handleAbort} disabled={isSubmitting}>
						?��?並�??��???
					</Button>

					<Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
						確�??�併
					</Button>
				</div>
			</div>
		</UserLayout>
	);
};
