import { Footer } from "@/shared/components/Footer/Footer";
import type { ReactNode } from "react";
import { useState } from "react";
import styles from "./AdminLayout.module.css";
import { AdminNav } from "./AdminNav";
interface AdminLayoutProps {
	children: ReactNode;
	fixedHeight?: boolean;
}

export const AdminLayout = ({ children, fixedHeight = false }: AdminLayoutProps) => {
	const [isNavOpen, setIsNavOpen] = useState(false);

	return (
		<div className={`${styles.container} ${fixedHeight ? styles.containerFixed : ""}`}>
			<AdminNav isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
			<main className={`${styles.main} ${isNavOpen ? styles.mainShifted : ""} ${fixedHeight ? styles.mainFixed : ""}`}>
				<div className={`${styles.content} ${fixedHeight ? styles.contentFixed : ""}`}>{children}</div>
				<Footer />
			</main>
		</div>
	);
};
