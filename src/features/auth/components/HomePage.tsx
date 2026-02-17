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
			<h1 className={styles.title}>Welcome to Core System</h1>
			<p className={styles.subtitle}>By NYCU SDC</p>

			{isAuthenticated ? (
				<>
					<Link to="/forms">
						<div className={styles.btn}>
							<Button themeColor="var(--color-caption)" disabled={isLoading}>
								Continue
							</Button>
						</div>
					</Link>
					<Link to="/logout">
						<div className={styles.btn}>
							<Button variant="secondary" disabled={isLoading}>
								Logout
							</Button>
						</div>
					</Link>
				</>
			) : (
				<>
					<div className={styles.btn}>
						<Button icon={School} themeColor="var(--color-caption)" disabled={isLoading} onClick={handleNycuLogin}>
							Login with NYCU Portal
						</Button>
					</div>
					<div className={styles.btn}>
						<Button simpleIcon={SiGoogle} themeColor="var(--orange)" disabled={isLoading} onClick={handleGoogleLogin}>
							Login with Google
						</Button>
					</div>
				</>
			)}
			<WaveMarquee />
		</UserLayout>
	);
};
