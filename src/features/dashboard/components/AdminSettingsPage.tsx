import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Button, Input } from "../../../shared/components";
import styles from "./AdminSettingsPage.module.css";

// Mock data
const mockMembers = [
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
	},
	{
		id: "3",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member"
	}
];

export const AdminSettingsPage = () => {
	const [orgName, setOrgName] = useState("SDC Organization");
	const [email, setEmail] = useState("");
	const [members, setMembers] = useState(mockMembers);
	const [isSaving, setIsSaving] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	const handleSaveOrgName = async () => {
		setIsSaving(true);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log("Saving org name:", orgName);
		setIsSaving(false);
	};

	const handleAddMember = async () => {
		if (!email.trim()) return;

		setIsAdding(true);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		const newMember = {
			id: String(members.length + 1),
			name: email.split("@")[0],
			email: email,
			role: "Member"
		};
		setMembers([...members, newMember]);
		setEmail("");
		setIsAdding(false);
		console.log("Added member:", email);
	};

	const handleKickMember = (memberId: string) => {
		if (confirm("Are you sure you want to remove this member?")) {
			setMembers(members.filter(m => m.id !== memberId));
			console.log("Kicked member:", memberId);
		}
	};

	return (
		<AdminLayout>
			<div className={styles.container}>
				<h1 className={styles.title}>Organization Settings</h1>
				<p className={styles.subtitle}>Manage your organization settings and members.</p>

				<div className={styles.cards}>
					{/* Organization Name */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Organization Name</h2>
						<div className={styles.formGroup}>
							<Input label="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Enter organization name" />
							<Button onClick={handleSaveOrgName} processing={isSaving}>
								Save Changes
							</Button>
						</div>
					</div>

					{/* Add Member */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Add Member</h2>
						<div className={styles.formGroup}>
							<Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" />
							<Button icon={UserPlus} onClick={handleAddMember} processing={isAdding} disabled={!email.trim()}>
								Add Member
							</Button>
						</div>
					</div>

					{/* Members List */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Organization Members</h2>
						<div className={styles.membersList}>
							{members.map(member => (
								<div key={member.id} className={styles.memberCard}>
									<div className={styles.memberInfo}>
										<div className={styles.memberName}>{member.name}</div>
										<div className={styles.memberEmail}>{member.email}</div>
									</div>
									<div className={styles.memberActions}>
										<span className={styles.memberRole}>{member.role}</span>
										<Button variant="secondary" icon={UserMinus} onClick={() => handleKickMember(member.id)} className={styles.kickButton}>
											Remove
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};
