import { authService } from "@/features/auth/services/authService";
import { UserLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { SiGmail } from "@icons-pack/react-simple-icons";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export const HomePage = () => {
	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.hero}>
					<h1 className={styles.title}>Welcome to Core System</h1>
					<p className={styles.subtitle}>Sign in to continue</p>
				</div>
				<div className={styles.buttons}>
					<Link to="/welcome">
						<Button
							icon={Github}
							themeColor="var(--purple)"
							onClick={() =>
								authService.redirectToOAuthLogin("google", {
									callbackUrl: `${window.location.origin}/auth/callback`,
									redirectUrl: "/dashboard"
								})
							}
						>
							Continue with GitHub
						</Button>
					</Link>
					<Link to="/orgs/sdc/forms">
						<Button
							simpleIcon={SiGmail}
							themeColor="var(--red)"
							onClick={() =>
								authService.redirectToOAuthLogin("google", {
									callbackUrl: `${window.location.origin}/auth/callback`,
									redirectUrl: "/dashboard"
								})
							}
						>
							Continue with Gmail
						</Button>
					</Link>
				</div>
			</div>
		</UserLayout>
	);
};
