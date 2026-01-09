import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Button, Input } from "../../../shared/components";
import styles from "./AdminSettingsPage.module.css";

// Mock data
const mockUsers = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		role: "Admin"
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "Member"
	}
];

export const AdminSettingsPage = () => {
	const [email, setEmail] = useState("");
	const [users, setUsers] = useState(mockUsers);

	const handleInvite = (e: React.FormEvent) => {
		e.preventDefault();
		if (email) {
			console.log("Inviting:", email);
			setEmail("");
		}
	};

	const handleDeleteUser = (userId: string) => {
		console.log("Deleting user:", userId);
		setUsers(users.filter(u => u.id !== userId));
	};

	return (
		<AdminLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Organization Settings</h1>
					<p className={styles.subtitle}>Manage your organization members and settings</p>
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Invite Members</h2>
					<form className={styles.inviteForm} onSubmit={handleInvite}>
						<div className={styles.inviteInput}>
							<Input id="email" type="email" placeholder="Enter email address" value={email} onChange={e => setEmail(e.target.value)} />
						</div>
						<Button type="submit" icon={UserPlus}>
							Invite
						</Button>
					</form>
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Team Members</h2>
					<div className={styles.userList}>
						{users.map(user => (
							<div key={user.id} className={styles.userItem}>
								<div className={styles.userInfo}>
									<span className={styles.userName}>{user.name}</span>
									<span className={styles.userEmail}>{user.email}</span>
								</div>
								<Button icon={Trash2} onClick={() => handleDeleteUser(user.id)} themeColor="var(--red)">
									Remove
								</Button>
							</div>
						))}
					</div>
				</div>

				<div className={`${styles.section} ${styles.dangerZone}`}>
					<h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
					<p className={styles.dangerDescription}>These actions are irreversible. Please be careful.</p>
					<Button themeColor="var(--red)">Delete Organization</Button>
				</div>
			</div>
		</AdminLayout>
	);
};
