import { UserLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { School } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import styles from "./HomePage.module.css";
import { WaveMarquee } from "./WaveMarquee";

export const HomePage = () => {
	const { isAuthenticated, isLoading } = useAuth();

	const handleGoogleLogin = () => {
		const origin = window.location.origin;
		authService.redirectToOAuthLogin("google", {
			callbackUrl: new URL("/callback", origin).toString(),
			redirectUrl: new URL("/callback", origin).toString()
		});
	};

	const handleNycuLogin = () => {
		const origin = window.location.origin;
		authService.redirectToOAuthLogin("nycu", {
			callbackUrl: new URL("/callback", origin).toString(),
			redirectUrl: new URL("/callback", origin).toString()
		});
	};

	return (
		<UserLayout>
			<h1 className={styles.title}>歡迎來到 Core System</h1>
			<p className={styles.subtitle}>NYCU SDC 製作</p>

			{isAuthenticated ? (
				<>
					<Link to="/forms">
						<div className={styles.btn}>
							<Button themeColor="var(--color-caption)" disabled={isLoading}>
								前往表單列表
							</Button>
						</div>
					</Link>
					<Link to="/logout">
						<div className={styles.btn}>
							<Button variant="secondary" disabled={isLoading}>
								登出
							</Button>
						</div>
					</Link>
				</>
			) : (
				<>
					<div className={styles.btn}>
						<Button icon={School} themeColor="var(--color-caption)" disabled={isLoading} onClick={handleNycuLogin}>
							使用 NYCU 帳號登入
						</Button>
					</div>
					<div className={styles.btn}>
						<Button simpleIcon={SiGoogle} themeColor="var(--orange)" disabled={isLoading} onClick={handleGoogleLogin}>
							使用 Google 帳號登入
						</Button>
					</div>
				</>
			)}
			<WaveMarquee />
		</UserLayout>
	);
};
