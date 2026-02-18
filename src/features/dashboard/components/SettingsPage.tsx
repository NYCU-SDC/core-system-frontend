import { useMe, useUpdateOnboarding } from "@/features/auth/hooks/useAuth";
import { Button, Input, Label, LoadingSpinner, Switch, Tooltip, useToast } from "@/shared/components";
import { useState } from "react";
import styles from "./SettingsPage.module.css";

export const SettingsPage = () => {
	const meQuery = useMe();
	const { pushToast } = useToast();
	const updateOnboardingMutation = useUpdateOnboarding();
	const [displayName, setDisplayName] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	const displayNameValue = displayName ?? meQuery.data?.name ?? "";
	const usernameValue = username ?? meQuery.data?.username ?? "";

	const handleSave = () => {
		const trimmedName = displayNameValue.trim();
		const trimmedUsername = usernameValue.trim();
		if (!trimmedName || !trimmedUsername) {
			pushToast({ title: "請填寫所有必填欄位", variant: "warning" });
			return;
		}
		updateOnboardingMutation.mutate(
			{ name: trimmedName, username: trimmedUsername },
			{
				onSuccess: () => {
					setDisplayName(null);
					setUsername(null);
					pushToast({ title: "儲存成功", description: "使用者資訊已更新。", variant: "success" });
				},
				onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
			}
		);
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
								<Label htmlFor="displayName">暱稱（name）</Label>
								<p style={{ fontSize: "0.75rem", color: "var(--color-caption)", margin: "0.1rem 0 0.25rem" }}>4–15 字元，僅限英數字與底線</p>
								<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
									<Input id="displayName" value={displayNameValue} onChange={e => setDisplayName(e.target.value)} placeholder={meQuery.isLoading ? "Loading…" : "Enter display name"} />
								</div>
							</div>
							<div className={styles.settingItem} style={{ marginTop: "0.75rem" }}>
								<Label htmlFor="username">使用者名稱（username）</Label>
								<p style={{ fontSize: "0.75rem", color: "var(--color-caption)", margin: "0.1rem 0 0.25rem" }}>唯一識別名稱，4–15 字元，僅限英數字與底線</p>
								<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
									<Input
										id="username"
										value={usernameValue}
										onChange={e => setUsername(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSave()}
										placeholder={meQuery.isLoading ? "Loading…" : "Enter username"}
									/>
								</div>
							</div>
							<div style={{ marginTop: "0.75rem" }}>
								<Button onClick={handleSave} processing={updateOnboardingMutation.isPending} disabled={meQuery.isLoading || !displayNameValue.trim() || !usernameValue.trim()}>
									儲存
								</Button>
							</div>
							<div className={styles.settingItem} style={{ marginTop: "0.75rem" }}>
								<div className={styles.settingInfo}>
									<div className={styles.settingLabel}>Email</div>
									<div className={styles.settingDescription}>
										{Array.isArray((meQuery.data as unknown as Record<string, unknown> | undefined)?.emails)
											? (((meQuery.data as unknown as Record<string, unknown>).emails as string[])[0] ?? "—")
											: "—"}
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
							<Tooltip content="此功能尚未支援，API 待開放">
								<Switch disabled />
							</Tooltip>
						</div>

						<div className={styles.settingItem}>
							<div className={styles.settingInfo}>
								<div className={styles.settingLabel}>Auto-save</div>
								<div className={styles.settingDescription}>Automatically save your changes</div>
							</div>
							<Tooltip content="此功能尚未支援，API 待開放">
								<Switch disabled />
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
