import { Footer } from "@/shared/components/Footer/Footer";
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import styles from "./UserLayout.module.css";

interface UserLayoutProps {
	children?: ReactNode;
	disablePadding?: boolean;
}

export const UserLayout = ({ children, disablePadding = false }: UserLayoutProps) => {
	return (
		<main className={styles.main}>
			<div className={`${styles.container} ${disablePadding ? styles.noPadding : ""}`}>{children ?? <Outlet />}</div>
			<Footer />
		</main>
	);
};
