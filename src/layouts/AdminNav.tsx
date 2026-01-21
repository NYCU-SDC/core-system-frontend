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

	// 1) /orgs/sdc/forms
	const isFormsDashboard = pathname === "/orgs/sdc/forms";

	// 2) /orgs/sdc/forms/:formid/info|edit|reply|design...
	const isFormDetail = !!matchPath({ path: "/orgs/sdc/forms/:formid/*", end: false }, pathname);

	// 3) /orgs/sdc/settings
	const isSettings = pathname.startsWith("/orgs/sdc/settings");

	const user = {
		name: "Alice King",
		username: "alice",
		avatarUrl: "",
		roles: ["user"]
	};

	const displayName = user.name || user.username || "??";
	const initials = displayName.slice(0, 2).toUpperCase();
	const hasAvatar = !!user.avatarUrl;

	const logOut = () => {
		// TODO: call auth logout
	};

	return (
		<>
			<div className={`${styles.container} ${isOpen ? styles.open : ""}`}>
				<nav className={styles.nav}>
					{/* upperNav */}
					<div className={styles.upperNav}>
						{/* menu */}
						<button
							type="button"
							className={`${styles.navItem} ${isOpen ? styles.navItemActive : ""} ${styles.burgerBtn}`}
							aria-label={isOpen ? "Close menu" : "Open menu"}
							aria-expanded={isOpen}
							onClick={() => setIsOpen(v => !v)}
						>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>

						<div className={`${styles.collapse} ${isOpen ? styles.collapseOpen : ""}`}>
							<Link to="/orgs/sdc/forms" className={styles.link} aria-label="Forms Dashboard">
								<div className={`${styles.navItem} ${isFormsDashboard ? styles.navItemActive : ""}`}>
									<ClipboardList size={24} />
									<span className={styles.label}>Forms</span>
								</div>
							</Link>

							<Link to={toInfo} className={styles.link} aria-label="Form Detail">
								<div className={`${styles.navItem} ${isFormDetail ? styles.navItemActive : ""}`}>
									<FileText size={24} />
									<span className={styles.label}>Detail</span>
								</div>
							</Link>
						</div>
					</div>

					{/* lowerNav */}
					<div className={styles.divider}>
						<div className={`${styles.collapse} ${isOpen ? styles.collapseOpen : ""}`}>
							<Link to="/orgs/sdc/settings" className={styles.link} aria-label="Settings">
								<div className={`${styles.navItem} ${isSettings ? styles.navItemActive : ""}`}>
									<Settings size={24} />
									<span className={styles.label}>Settings</span>
								</div>
							</Link>

							<div className={styles.avatarContainer}>
								{hasAvatar ? <img src={user.avatarUrl} alt={displayName} className={styles.avatarImg} /> : <div className={styles.avatarFallback}>{initials}</div>}
							</div>

							<Link to="/" className={styles.link} aria-label="Logout">
								<div className={`${styles.navItem} ${styles.logoutItem}`}>
									<LogOut size={24} />
									<span className={styles.label}>LogOut</span>
								</div>
							</Link>
						</div>
					</div>
				</nav>
			</div>
		</>
	);
};
