import { Switch } from "@/shared/components";
import styles from "./SettingsPage.module.css";

export const SettingsPage = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Settings</h1>
			<p className={styles.subtitle}>Manage your application settings and preferences.</p>

			<div className={styles.cards}>
				<div className={styles.card}>
					<h2 className={styles.cardTitle}>General Settings</h2>
					<div className={styles.settings}>
						<div className={styles.settingItem}>
							<div className={styles.settingInfo}>
								<div className={styles.settingLabel}>Email Notifications</div>
								<div className={styles.settingDescription}>Receive email updates about your account</div>
							</div>
							<Switch defaultChecked />
						</div>

						<div className={styles.settingItem}>
							<div className={styles.settingInfo}>
								<div className={styles.settingLabel}>Dark Mode</div>
								<div className={styles.settingDescription}>Enable dark theme across the application</div>
							</div>
							<Switch />
						</div>

						<div className={styles.settingItem}>
							<div className={styles.settingInfo}>
								<div className={styles.settingLabel}>Auto-save</div>
								<div className={styles.settingDescription}>Automatically save your changes</div>
							</div>
							<Switch defaultChecked />
						</div>
					</div>
				</div>

				<div className={styles.card}>
					<h2 className={styles.cardTitle}>Account Settings</h2>
					<p className={styles.settingDescription}>Account management options coming soon.</p>
				</div>
			</div>
		</div>
	);
};
