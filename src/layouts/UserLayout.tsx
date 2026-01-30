import type { ReactNode } from "react";
import styles from "./UserLayout.module.css";

interface UserLayoutProps {
	children: ReactNode;
	isCenter?: boolean;
}

export const UserLayout = ({ children, isCenter = false }: UserLayoutProps) => {
	return (
		<div className={`${styles.container} ${isCenter ? styles.center : ""}`}>
			<div className={styles.content}>{children}</div>
		</div>
	);
};
