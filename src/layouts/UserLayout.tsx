import type { ReactNode } from "react";
import { Footer } from "../shared/components/Footer/Footer";
import styles from "./UserLayout.module.css";

interface UserLayoutProps {
	children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
	return (
		<>
			<div className={styles.container}>
				<div className={styles.content}>{children}</div>
			</div>
			<Footer />
		</>
	);
};
