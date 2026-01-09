import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
	children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
	return (
		<div className={styles.container}>
			<nav className={styles.nav}>
				<h2 className={styles.navTitle}>Admin Panel</h2>
				<ul className={styles.navList}>
					<li className={styles.navItem}>
						<NavLink to="/orgs/sdc/forms" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>
							<span className={styles.navIcon}>
								<LayoutDashboard size={20} />
							</span>
							Forms
						</NavLink>
					</li>
					<li className={styles.navItem}>
						<NavLink to="/orgs/sdc/settings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>
							<span className={styles.navIcon}>
								<Settings size={20} />
							</span>
							Settings
						</NavLink>
					</li>
					<li className={styles.navItem}>
						<NavLink to="/logout" className={styles.navLink}>
							<span className={styles.navIcon}>
								<LogOut size={20} />
							</span>
							Logout
						</NavLink>
					</li>
				</ul>
			</nav>
			<main className={styles.main}>
				<div className={styles.content}>{children}</div>
			</main>
		</div>
	);
};
