import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminNav.module.css";

const navItems = [
	{ path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
	{ path: "/admin/users", icon: Users, label: "Users" },
	{ path: "/admin/settings", icon: Settings, label: "Settings" }
];

export const AdminNav = () => {
	const location = useLocation();

	return (
		<div className={styles.container}>
			<span className={styles.title}>Admin Panel</span>

			<nav className={styles.nav}>
				{navItems.map(item => {
					const Icon = item.icon;
					const isActive = location.pathname === item.path;

					return (
						<Link key={item.path} to={item.path} className={styles.link}>
							<div className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
								<Icon size={20} />
								<span className={styles.navLabel}>{item.label}</span>
							</div>
						</Link>
					);
				})}

				<div className={styles.divider}>
					<Link to="/" className={styles.link}>
						<div className={styles.logoutItem}>
							<LogOut size={20} />
							<span className={styles.navLabel}>Logout</span>
						</div>
					</Link>
				</div>
			</nav>
		</div>
	);
};
