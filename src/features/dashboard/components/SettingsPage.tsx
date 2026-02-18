import { useMe } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";
import { Button, Input, Label, LoadingSpinner, Switch, useToast } from "@/shared/components";
import { useState } from "react";
import styles from "./SettingsPage.module.css";

export const SettingsPage = () => {
	const meQuery = useMe();
	const { pushToast } = useToast();
	const [username, setUsername] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const usernameValue = username ?? meQuery.data?.name ?? "";

	const handleSaveUsername = async () => {
		const trimmed = usernameValue.trim();
		if (!trimmed) return;
		setIsSaving(true);
		try {
			await authService.updateOnboarding({ name: trimmed });
			setUsername(null);
			meQuery.refetch();
			pushToast({ title: "儲存成功", description: "使用者名稱已更新。", variant: "success" });
		} catch (e) {
			pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Settings</h1>
			<p className={styles.subtitle}>Manage your application settings and preferences.</p>

			<div className={styles.cards}>
				<div className={styles.card}>
					<h2 className={styles.cardTitle}>Account Settings</h2>
					{meQuery.isLoading ? (
						<LoadingSpinner />
					) : (
						<div className={styles.settings}>
							<div className={styles.settingItem}>
								<Label htmlFor="username">使用者名稱</Label>
								<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
									<Input
										id="username"
										value={usernameValue}
										onChange={e => setUsername(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSaveUsername()}
										placeholder={meQuery.isLoading ? "Loading…" : "Enter username"}
									/>
									<Button onClick={handleSaveUsername} processing={isSaving} disabled={meQuery.isLoading || !usernameValue.trim()}>
										儲存
									</Button>
								</div>
							</div>
							<div className={styles.settingItem} style={{ marginTop: "0.75rem" }}>
								<div className={styles.settingInfo}>
									<div className={styles.settingLabel}>Email</div>
									<div className={styles.settingDescription}>
										{Array.isArray((meQuery.data as Record<string, unknown> | undefined)?.emails) ? (((meQuery.data as Record<string, unknown>).emails as string[])[0] ?? "—") : "—"}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

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
								<div className={styles.settingLabel}>Auto-save</div>
								<div className={styles.settingDescription}>Automatically save your changes</div>
							</div>
							<Switch defaultChecked />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
