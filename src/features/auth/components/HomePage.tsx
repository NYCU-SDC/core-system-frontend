import { Github, Mail } from "lucide-react";
import { UserLayout } from "../../../layouts";
import { Button } from "../../../shared/components";
import styles from "./HomePage.module.css";

export function HomePage() {
	const handleGithubLogin = () => {
		console.log("GitHub OAuth login");
		// Implement OAuth flow
	};

	const handleGoogleLogin = () => {
		console.log("Google OAuth login");
		// Implement OAuth flow
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.hero}>
					<h1 className={styles.title}>Welcome to Core System</h1>
					<p className={styles.subtitle}>Sign in to continue</p>
				</div>
				<div className={styles.buttons}>
					<Button icon={Github} onClick={handleGithubLogin} themeColor="var(--purple)">
						Continue with GitHub
					</Button>
					<Button icon={Mail} onClick={handleGoogleLogin} themeColor="var(--pink)">
						Continue with Google
					</Button>
				</div>
			</div>
		</UserLayout>
	);
}
