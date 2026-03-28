import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button } from "@/shared/components";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { ArrowLeftRight, School } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { NameMarquee } from "./NameMarquee";
import styles from "./OauthLinkPage.module.css";

export const OauthLinkPage = () => {
	const meta = useSeo({ rule: SEO_CONFIG.oauthLink });
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const name = searchParams.get("name") ?? "";
	const email = searchParams.get("email") ?? "";
	const oauthProvider = searchParams.get("oauthProvider") ?? "";
	const isSupportedProvider = oauthProvider === "google" || oauthProvider === "nycu";

	const displayName = name || "User";
	// Assume query.oauthProvider refers to the provider already linked to the existing account.
	const existingProvider = isSupportedProvider ? oauthProvider : "google";
	const newProvider = existingProvider === "google" ? "nycu" : "google";
	const [isLinking, setIsLinking] = useState(false);
	const [isAborting, setIsAborting] = useState(false);

	const providerConfig = {
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
	} as const;

	const isInvalidLinkRequest = !name || !email || !oauthProvider || !isSupportedProvider;

	useEffect(() => {
		if (isInvalidLinkRequest) {
			navigate("/", { replace: true });
		}
	}, [isInvalidLinkRequest, navigate]);

	if (isInvalidLinkRequest) {
		return null;
	}

	const handleConfirm = async () => {
		if (isLinking) return; // prevent multiple clicks

		try {
			setIsLinking(true);

			await authService.linkOauthAccount();

			window.location.href = "/";
		} catch (error) {
			console.error("Link account failed:", error);

			alert("連結已失效，請重新登入");
			window.location.href = "/";
		} finally {
			setIsLinking(false);
		}
	};

	const handleAbort = async () => {
		if (isAborting) return; // prevent multiple clicks
		try {
			setIsAborting(true);
			await authService.abortLinkOauthAccount();
			window.location.href = "/";
		} catch (error) {
			console.error("Abort link failed:", error);
		} finally {
			setIsAborting(false);
		}
	};

	return (
		<UserLayout>
			{meta}
			<NameMarquee name={`${displayName}!`} />
			<div className={styles.content}>
				<div className={styles.text}>
					<h1 className={styles.title}>Hi, {displayName}，我們將進行帳號合併！</h1>
					<p className={styles.description}>
						{`系統偵測到您的 ${newProvider} 電子郵件與既有的 ${existingProvider} 帳號相同。合併帳號後，您將能夠使用 ${newProvider} 或 ${existingProvider} 驗證方式登入，並存取相同的個人資料與設定。`}
					</p>
				</div>

				<div className={styles.accountBridge} aria-label="OAuth account connection preview">
					<div className={styles.accountSide}>
						<div className={`${styles.accountIcon} ${providerConfig[newProvider].iconClassName}`}>{providerConfig[newProvider].icon}</div>
						<span className={styles.accountLabel}>{providerConfig[newProvider].label}</span>
					</div>

					<div className={styles.bridgeCenter}>
						<div className={styles.bridgeLine} />
						<div className={styles.bridgeSwap}>
							<ArrowLeftRight size={26} />
						</div>
						<div className={styles.bridgeLine} />
					</div>

					<div className={styles.accountSide}>
						<div className={`${styles.accountIcon} ${providerConfig[existingProvider].iconClassName}`}>{providerConfig[existingProvider].icon}</div>
						<span className={styles.accountLabel}>{providerConfig[existingProvider].label}</span>
					</div>
				</div>

				<div className={styles.actions}>
					<Button type="button" variant="secondary" onClick={handleAbort} disabled={isAborting || isLinking}>
						{isAborting ? "返回中" : "取消並返回首頁"}
					</Button>
					<Button type="button" onClick={handleConfirm} disabled={isAborting || isLinking}>
						{isLinking ? "合併處理中" : "確認合併"}
					</Button>
				</div>
				<p className={styles.description}>取消後不會建立新帳號，本次登入流程將終止。</p>
			</div>
		</UserLayout>
	);
};
