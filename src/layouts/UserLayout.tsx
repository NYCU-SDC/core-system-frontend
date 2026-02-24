import { Footer } from "@/shared/components/Footer/Footer";
import type { ReactNode } from "react";
import styles from "./UserLayout.module.css";
import { useAuthRefreshInterval } from "./useAuthRefreshInterval";

interface UserLayoutProps {
	children: ReactNode;
	disablePadding?: boolean;
}

export const UserLayout = ({ children, disablePadding = false }: UserLayoutProps) => {
	useAuthRefreshInterval();
	return (
		<main className={styles.main}>
			<div className={`${styles.container} ${disablePadding ? styles.noPadding : ""}`}>{children}</div>
			<Footer />
		</main>
	);
};
