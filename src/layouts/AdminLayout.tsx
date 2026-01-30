import type { ReactNode } from "react";
import { Footer } from "../shared/components/Footer/Footer";
import styles from "./AdminLayout.module.css";
import { AdminNav } from "./AdminNav";
interface AdminLayoutProps {
	children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
	return (
		<>
			<div className={styles.container}>
				<AdminNav />
				<main className={styles.main}>
					<div className={styles.content}>{children}</div>
					<Footer></Footer>
				</main>
			</div>
		</>
	);
};
