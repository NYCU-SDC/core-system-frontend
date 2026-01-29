import { AdminLayout } from "@/layouts";
import { Button, Input, Label } from "@/shared/components";
import { LogOut } from "lucide-react";
import { useState } from "react";
import styles from "./AdminSettingsPage.module.css";
// Mock data
const mockMembers = [
	{
		id: "1",
		name: "Hi O",
		email: "andrew12345432@example.com",
		role: "Admin",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "3",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "4",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "5",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "6",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
	},
	{
		id: "7",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Member",
		avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocImYbRhbuxGVqSFN_AhoVrrKrbybkVKKfgl3GV_32kZa8hxUsls=s96-c"
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
				<h1 className={styles.title}>組織管理</h1>
				<h2>組織資訊</h2>
				<section className={styles.section}>
					<Label required htmlFor="orgName">
						組織名稱
					</Label>
					<Input id="orgName" value={orgName} onChange={e => setOrgName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveOrgName()} placeholder="請輸入文字..." />
				</section>
				<h2>成員</h2>
				<section className={styles.addMember}>
					<Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" />
					<Button onClick={handleAddMember} processing={isAdding} disabled={!email.trim()}>
						新增成員
					</Button>
				</section>
				<div className={styles.membersList}>
					{members.map(member => (
						<div key={member.id} className={styles.memberCard}>
							<img src={member.avatarUrl} alt="照片描述" className={styles.memberImg} />
							<div className={styles.memberInfo}>
								<h4 className={styles.memberName}>{member.name}</h4>
								<div className={styles.memberEmail}>{member.email}</div>
							</div>
							<div className={styles.memberActions}>
								<Button themeColor="var(--purple)" icon={LogOut} onClick={() => handleKickMember(member.id)} className={styles.kickButton}></Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</AdminLayout>
	);
};
