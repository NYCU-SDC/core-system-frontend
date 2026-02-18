import type { ReactNode } from "react";
import { useState } from "react";
import { Footer } from "../shared/components/Footer/Footer";
import styles from "./AdminLayout.module.css";
import { AdminNav } from "./AdminNav";
interface AdminLayoutProps {
	children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
	const [isNavOpen, setIsNavOpen] = useState(false);

	return (
		<div className={styles.container}>
			<AdminNav isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
			<main className={`${styles.main} ${isNavOpen ? styles.mainShifted : ""}`}>
				<div className={styles.content}>{children}</div>
				<Footer />
			</main>
		</div>
	);
};
