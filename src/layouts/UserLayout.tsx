import type { ReactNode } from "react";
import { Footer } from "../shared/components/Footer/Footer";
import styles from "./UserLayout.module.css";

interface UserLayoutProps {
	children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
	return (
		<main className={styles.main}>
			<div className={styles.container}>{children}</div>
			<Footer />
		</main>
	);
};
