import { useActiveOrgSlug, useOrgMembers } from "@/features/dashboard/hooks/useOrgSettings";
import { LoadingSpinner, useToast } from "@/shared/components";
import { useEffect } from "react";
import styles from "./UsersPage.module.css";

export const UsersPage = () => {
	const orgSlug = useActiveOrgSlug();
	const { pushToast } = useToast();
	const membersQuery = useOrgMembers(orgSlug);

	useEffect(() => {
		if (membersQuery.error) pushToast({ title: "無法載入成員列表", description: (membersQuery.error as Error).message, variant: "error" });
	}, [membersQuery.error]); // eslint-disable-line react-hooks/exhaustive-deps

	const members = membersQuery.data ?? [];

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Users</h1>
			<p className={styles.subtitle}>Manage your application users.</p>

			<div className={styles.card}>
				{membersQuery.isLoading ? (
					<LoadingSpinner />
				) : (
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>ID</th>
							</tr>
						</thead>
						<tbody>
							{(members as unknown as Record<string, unknown>[]).map(user => {
								const id = String(user.id ?? "");
								const name = String(user.name ?? "");
								const emails = Array.isArray(user.emails) ? user.emails : [];
								const email = String(emails[0] ?? "");
								return (
									<tr key={id}>
										<td>{name}</td>
										<td>{email}</td>
										<td style={{ fontSize: "0.75rem", color: "var(--color-caption)" }}>{id}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};
