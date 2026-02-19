import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { ClipboardList, FileText, LogOut, Menu, Settings, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminNav.module.css";

interface AdminNavProps {
	isOpen: boolean;
	setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export const AdminNav = ({ isOpen, setIsOpen }: AdminNavProps) => {
	const { pathname } = useLocation();
	const orgSlug = useActiveOrgSlug();

	const isUserForms = pathname === "/forms" || pathname.startsWith("/forms/");
	const isFormsDashboard = pathname === `/orgs/${orgSlug}/forms` || pathname.startsWith(`/orgs/${orgSlug}/forms/`);
	const isSettings = pathname.startsWith(`/orgs/${orgSlug}/settings`);

	const { user, canAccessOrgAdmin, isLoading } = useOrgAdminAccess();

	if (isLoading || !canAccessOrgAdmin) return null;

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
						<Link to="/forms" reloadDocument className={styles.link} title="我的表單">
							<div className={`${styles.navItem} ${isUserForms ? styles.navItemActive : ""}`}>
								<ClipboardList size={22} />
							</div>
						</Link>

						<Link to={`/orgs/${orgSlug}/forms`} className={styles.link} title="表單管理">
							<div className={`${styles.navItem} ${isFormsDashboard ? styles.navItemActive : ""}`}>
								<FileText size={22} />
							</div>
						</Link>
					</div>

					{/* Lower */}
					<div className={styles.divider}>
						<Link to={`/orgs/${orgSlug}/settings`} className={styles.link}>
							<div className={`${styles.navItem} ${isSettings ? styles.navItemActive : ""}`}>
								<Settings size={22} />
							</div>
						</Link>

						{/* Avatar */}
						<div className={styles.avatarContainer} title={user?.username || displayName}>
							{hasAvatar ? <img src={user?.avatarUrl} alt={displayName} className={styles.avatarImg} /> : <div className={styles.avatarFallback}>{initials}</div>}
						</div>

						<Link to="/logout" className={styles.link} aria-label="登出" title="登出">
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
