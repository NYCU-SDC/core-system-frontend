import { useAddOrgMember, useOrg, useOrgMembers, useRemoveOrgMember, useUpdateOrg } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminLayout } from "@/layouts";
import { Button, Input, Label } from "@/shared/components";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./AdminSettingsPage.module.css";

type MemberRow = {
	id: string;
	name: string;
	email: string;
	// roleLabel: string;
	avatarUrl: string;
};

/* ---------- API 資料轉 UI Model ---------- */
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const getStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

const toMemberRow = (value: unknown): MemberRow | null => {
	if (!isRecord(value)) return null;
	const member = value;
	if (!isRecord(member)) return null;

	const id = getString(member.id);
	const name = getString(member.name);
	const emails = getStringArray(member.emails);
	// const email = emails[0] ?? null;
	const email = emails[0] ?? "";

	if (!id || !name) return null;

	// const roles = getStringArray(member.roles);
	// const roleLabel = roles.includes("admin") ? "Admin" : "Member";

	const avatarUrl = getString(member.avatarUrl) ?? ""; // TEMP : add fallback value
	return { id, name, email, avatarUrl };
};

export const AdminSettingsPage = () => {
	// NOTE: current routes are hard-coded to /orgs/sdc/*
	const orgSlug = "SDC";

	const orgQuery = useOrg(orgSlug);
	const membersQuery = useOrgMembers(orgSlug);

	console.log("orgQuery", { status: orgQuery.status, data: orgQuery.data, error: orgQuery.error });
	console.log("membersQuery", { status: membersQuery.status, data: membersQuery.data, error: membersQuery.error });

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
				<h1 className={styles.title}>組織管理</h1>
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
				<h2>組織資訊</h2>
				<section className={styles.section}>
					<Label required htmlFor="orgName">
						組織名稱
					</Label>
					<div className={styles.inputRow}>
						<Input
							id="orgName"
							value={orgNameValue}
							onChange={e => setOrgNameDraft(e.target.value)}
							onKeyDown={e => e.key === "Enter" && handleSaveOrgName()}
							placeholder={orgQuery.isLoading ? "Loading…" : "Enter organization name"}
						/>
						<Button onClick={handleSaveOrgName} processing={updateOrgMutation.isPending} disabled={orgQuery.isLoading || !orgQuery.data}>
							Save Changes
						</Button>
					</div>
				</section>
				<h2>成員</h2>
				<section className={styles.addMember}>
					<Input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddMember()} placeholder="member@example.com" />
					<Button onClick={handleAddMember} processing={addMemberMutation.isPending} disabled={!email.trim() || addMemberMutation.isPending}>
						新增成員
					</Button>
				</section>
				<div className={styles.membersList}>
					{membersQuery.isLoading ? (
						<LoadingSpinner />
					) : members.length === 0 ? (
						<div className={styles.memberEmail}>No members found.</div>
					) : (
						members.map(member => (
							<div key={member.id} className={styles.memberCard}>
								<img src={member.avatarUrl} alt={member.name} referrerPolicy="no-referrer" className={styles.memberImg} />
								<div className={styles.memberInfo}>
									<div className={styles.memberName}>{member.name}</div>
									<div className={styles.memberEmail}>{member.email}</div>
								</div>
								<div className={styles.memberActions}>
									{/* <span className={styles.memberRole}>{member.roleLabel}</span> */}
									<Button themeColor="var(--purple)" icon={LogOut} onClick={() => handleKickMember(member.id)} disabled={removeMemberMutation.isPending}></Button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</AdminLayout>
	);
};
