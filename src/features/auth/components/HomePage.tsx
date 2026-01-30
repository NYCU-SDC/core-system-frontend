import { UserLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { School } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import { WaveMarquee } from "./WaveMarquee";

export const HomePage = () => {
	return (
		<UserLayout>
			<h1 className={styles.title}>Welcome to Core System</h1>
			<p className={styles.subtitle}>By NYCU SDC</p>
			<Link to="/welcome">
				<div className={styles.btn}>
					<Button icon={School} themeColor="var(--color-caption)">
						Login with NYCU Portal
					</Button>
				</div>
			</Link>
			<Link to="/orgs/sdc/forms">
				<div className={styles.btn}>
					<Button simpleIcon={SiGoogle} themeColor="var(--orange)">
						Login with Google
					</Button>
				</div>
			</Link>
			<WaveMarquee />
		</UserLayout>
	);
};