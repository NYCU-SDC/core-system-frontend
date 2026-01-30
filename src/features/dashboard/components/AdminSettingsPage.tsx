import { useAddOrgMember, useOrg, useOrgMembers, useRemoveOrgMember, useUpdateOrg } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminLayout } from "@/layouts";
import { Button, Input } from "@/shared/components";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./AdminSettingsPage.module.css";

type MemberRow = {
	id: string;
	name: string;
	email: string;
	roleLabel: string;
};

/* ---------- API 資料轉 UI Model ---------- */
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const getStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

const toMemberRow = (value: unknown): MemberRow | null => {
	if (!isRecord(value)) return null;
	const member = value.member;
	if (!isRecord(member)) return null;

	const id = getString(member.id);
	const name = getString(member.name);
	const emails = getStringArray(member.emails);
	const email = emails[0] ?? null;

	if (!id || !name || !email) return null;

	const roles = getStringArray(member.roles);
	const roleLabel = roles.includes("admin") ? "Admin" : "Member";

	return { id, name, email, roleLabel };
};

export const AdminSettingsPage = () => {
	// NOTE: current routes are hard-coded to /orgs/sdc/*
	const orgSlug = "sdc";

	const orgQuery = useOrg(orgSlug);
	const membersQuery = useOrgMembers(orgSlug);

	const updateOrgMutation = useUpdateOrg(orgSlug);
	const addMemberMutation = useAddOrgMember(orgSlug);
	const removeMemberMutation = useRemoveOrgMember(orgSlug);

	const [orgNameDraft, setOrgNameDraft] = useState<string | null>(null);
	const [email, setEmail] = useState("");

	const orgNameValue = orgNameDraft ?? orgQuery.data?.name ?? "";

	const members: MemberRow[] = useMemo(() => {
		const raw = membersQuery.data ?? [];
		return raw.map(toMemberRow).filter((m): m is MemberRow => m !== null);
	}, [membersQuery.data]);

	const handleSaveOrgName = () => {
		if (!orgQuery.data) return;

		updateOrgMutation.mutate(
			{
				name: orgNameDraft ?? orgQuery.data.name,
				description: orgQuery.data.description ?? "",
				metadata: orgQuery.data.metadata ?? {},
				slug: orgQuery.data.slug
			},
			{
				onSuccess: () => setOrgNameDraft(null)
			}
		);
	};

	const handleAddMember = () => {
		const trimmed = email.trim();
		if (!trimmed) return;

		addMemberMutation.mutate(
			{ email: trimmed },
			{
				onSuccess: () => setEmail("")
			}
		);
	};

	const handleKickMember = (memberId: string) => {
		if (confirm("Are you sure you want to remove this member?")) {
			removeMemberMutation.mutate(memberId);
		}
	};

	return (
		<AdminLayout>
			<div className={styles.container}>
				<h1 className={styles.title}>Organization Settings</h1>
				<p className={styles.subtitle}>Manage your organization settings and members.</p>

				{(orgQuery.isError || membersQuery.isError || updateOrgMutation.isError || addMemberMutation.isError || removeMemberMutation.isError) && (
					<ErrorMessage
						message={
							(orgQuery.error as Error)?.message ||
							(membersQuery.error as Error)?.message ||
							(updateOrgMutation.error as Error)?.message ||
							(addMemberMutation.error as Error)?.message ||
							(removeMemberMutation.error as Error)?.message ||
							"Something went wrong."
						}
					/>
				)}

				<div className={styles.cards}>
					{/* Organization Name */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Organization Name</h2>
						<div className={styles.formGroup}>
							<Input label="Organization Name" value={orgNameValue} onChange={e => setOrgNameDraft(e.target.value)} placeholder={orgQuery.isLoading ? "Loading…" : "Enter organization name"} />
							<Button onClick={handleSaveOrgName} processing={updateOrgMutation.isPending} disabled={orgQuery.isLoading || !orgQuery.data}>
								Save Changes
							</Button>
						</div>
					</div>

					{/* Add Member */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Add Member</h2>
						<div className={styles.formGroup}>
							<Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" />
							<Button icon={UserPlus} onClick={handleAddMember} processing={addMemberMutation.isPending} disabled={!email.trim() || addMemberMutation.isPending}>
								Add Member
							</Button>
						</div>
					</div>

					{/* Members List */}
					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Organization Members</h2>
						<div className={styles.membersList}>
							{membersQuery.isLoading ? (
								<LoadingSpinner />
							) : members.length === 0 ? (
								<div className={styles.memberEmail}>No members found.</div>
							) : (
								members.map(member => (
									<div key={member.id} className={styles.memberCard}>
										<div className={styles.memberInfo}>
											<div className={styles.memberName}>{member.name}</div>
											<div className={styles.memberEmail}>{member.email}</div>
										</div>
										<div className={styles.memberActions}>
											<span className={styles.memberRole}>{member.roleLabel}</span>
											<Button variant="secondary" icon={UserMinus} onClick={() => handleKickMember(member.id)} disabled={removeMemberMutation.isPending}>
												Remove
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};
