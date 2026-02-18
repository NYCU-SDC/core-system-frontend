import { useOrgMembers } from "@/features/dashboard/hooks/useOrgSettings";
import { ErrorMessage, LoadingSpinner } from "@/shared/components";
import styles from "./UsersPage.module.css";

export const UsersPage = () => {
	const orgSlug = "sdc";
	const membersQuery = useOrgMembers(orgSlug);

	const members = membersQuery.data ?? [];

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Users</h1>
			<p className={styles.subtitle}>Manage your application users.</p>

			{membersQuery.isError && <ErrorMessage message={(membersQuery.error as Error)?.message || "Failed to load users"} />}

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
