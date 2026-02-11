import { useAuth } from "@/features/auth/hooks/useAuth";
import { ClipboardList, FileText, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { Link, matchPath, useLocation, useParams } from "react-router-dom";
import styles from "./AdminNav.module.css";

export const AdminNav = () => {
	const { formid } = useParams();
	const { pathname } = useLocation();

	const DEMO_FORM_ID = ":formid";
	const toInfo = `/orgs/sdc/forms/${formid ?? DEMO_FORM_ID}/info`;

	const [isOpen, setIsOpen] = useState(false);

	const isFormsDashboard = pathname === "/orgs/sdc/forms";
	const isFormDetail = !!matchPath({ path: "/orgs/sdc/forms/:formid/*", end: false }, pathname);
	const isSettings = pathname.startsWith("/orgs/sdc/settings");

	const { user } = useAuth();

	const displayName = user?.name || user?.username || user?.emails?.[0] || "ˊ_>ˋ";
	const initials = user ? displayName.slice(0, 2).toUpperCase() : displayName;
	const hasAvatar = !!user?.avatarUrl;

	return (
		<>
			{/* Hamburger — 永遠獨立 */}
			<button type="button" className={styles.burgerBtn} aria-expanded={isOpen} onClick={() => setIsOpen(v => !v)}>
				{isOpen ? <X size={22} /> : <Menu size={22} />}
			</button>

			{/* Sidebar */}
			<aside className={`${styles.container} ${isOpen ? styles.open : ""}`}>
				<nav className={styles.nav}>
					{/* Upper */}
					<div className={styles.upperNav}>
						<Link to="/orgs/sdc/forms" className={styles.link}>
							<div className={`${styles.navItem} ${isFormsDashboard ? styles.navItemActive : ""}`}>
								<ClipboardList size={22} />
							</div>
						</Link>

						<Link to={toInfo} className={styles.link}>
							<div className={`${styles.navItem} ${isFormDetail ? styles.navItemActive : ""}`}>
								<FileText size={22} />
							</div>
						</Link>
					</div>

					{/* Lower */}
					<div className={styles.divider}>
						<Link to="/orgs/sdc/settings" className={styles.link}>
							<div className={`${styles.navItem} ${isSettings ? styles.navItemActive : ""}`}>
								<Settings size={22} />
							</div>
						</Link>

						{/* Avatar */}
						<div className={styles.avatarContainer} title={user?.username || displayName}>
							{hasAvatar ? <img src={user?.avatarUrl} alt={displayName} className={styles.avatarImg} /> : <div className={styles.avatarFallback}>{initials}</div>}
						</div>

						<Link to="/logout" className={styles.link} aria-label="Logout" title="Logout">
							<div className={`${styles.navItem} ${styles.logoutItem}`}>
								<LogOut size={22} />
							</div>
						</Link>
					</div>
				</nav>
			</aside>
		</>
	);
};
