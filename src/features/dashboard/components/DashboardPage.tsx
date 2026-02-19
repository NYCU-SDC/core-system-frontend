import { useMe } from "@/features/auth/hooks/useAuth";
import { useActiveOrgSlug, useOrgMembers } from "@/features/dashboard/hooks/useOrgSettings";
import { useOrgForms } from "@/features/form/hooks/useOrgForms";
import { LoadingSpinner } from "@/shared/components";
import { BarChart3, FileText, Users } from "lucide-react";
import styles from "./DashboardPage.module.css";

export const DashboardPage = () => {
	const meQuery = useMe();
	const orgSlug = useActiveOrgSlug();

	const membersQuery = useOrgMembers(orgSlug);
	const formsQuery = useOrgForms(orgSlug);
	const totalMembers = membersQuery.data?.length ?? 0;
	const totalForms = formsQuery.data?.length ?? 0;
	const publishedForms = formsQuery.data?.filter(f => f.status === "PUBLISHED").length ?? 0;

	const stats = [
		{ icon: Users, label: "成員數", value: membersQuery.isLoading ? "…" : String(totalMembers) },
		{ icon: FileText, label: "表單總數", value: formsQuery.isLoading ? "…" : String(totalForms) },
		{ icon: BarChart3, label: "已發布表單", value: formsQuery.isLoading ? "…" : String(publishedForms) }
	];

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Dashboard</h1>
			<p className={styles.subtitle}>{meQuery.isLoading ? <LoadingSpinner /> : `歡迎回來，${meQuery.data?.name ?? ""}！`}</p>

			<div className={styles.grid}>
				{stats.map(stat => {
					const Icon = stat.icon;
					return (
						<div key={stat.label} className={styles.statCard}>
							<div className={styles.icon}>
								<Icon size={24} />
							</div>
							<span className={styles.statLabel}>{stat.label}</span>
							<div className={styles.statValue}>{stat.value}</div>
						</div>
					);
				})}
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>最近表單</h2>
				{formsQuery.isLoading ? (
					<LoadingSpinner />
				) : (formsQuery.data?.slice(0, 5) ?? []).length === 0 ? (
					<p className={styles.cardContent}>尚無表單。</p>
				) : (
					<ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
						{formsQuery.data!.slice(0, 5).map(form => (
							<li key={form.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span>{form.title}</span>
								<span style={{ fontSize: "0.75rem", color: "var(--color-caption)" }}>{form.status}</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};
