import styles from "./UsersPage.module.css";

const users = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" }
];

export const UsersPage = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Users</h1>
			<p className={styles.subtitle}>Manage your application users.</p>

			<div className={styles.card}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => (
							<tr key={user.id}>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>{user.role}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
