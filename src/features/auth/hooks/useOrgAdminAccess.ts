import { useOrgMembers } from "@/features/dashboard/hooks/useOrgSettings";
import { useMemo } from "react";
import { useAuth } from "./useAuth";

const ORG_SLUG = "SDC";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const getString = (value: unknown): string | null => (typeof value === "string" ? value : null);
const getStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
const normalize = (value: string) => value.trim().toLowerCase();

export const useOrgAdminAccess = () => {
	const { user, isLoading: isAuthLoading } = useAuth();
	const membersQuery = useOrgMembers(ORG_SLUG, !!user);

	const isOrgMember = useMemo(() => {
		if (!user) return false;
		const rawMembers = membersQuery.data;
		if (!Array.isArray(rawMembers)) return false;

		const byId = normalize(user.id ?? "");
		const byUsername = normalize(user.username ?? "");
		const byEmails = new Set((user.emails ?? []).map(normalize));

		return rawMembers.some(item => {
			if (!isRecord(item)) return false;
			const member = isRecord(item.member) ? item.member : item;

			const memberId = normalize(getString(member.id) ?? "");
			const memberUsername = normalize(getString(member.username) ?? "");
			const memberEmails = getStringArray(member.emails).map(normalize);

			if (byId && memberId && byId === memberId) return true;
			if (byUsername && memberUsername && byUsername === memberUsername) return true;

			return memberEmails.some(email => byEmails.has(email));
		});
	}, [membersQuery.data, user]);

	const isLoading = isAuthLoading || membersQuery.isLoading;
	const canAccessOrgAdmin = isOrgMember;

	return {
		user,
		canAccessOrgAdmin,
		isLoading
	};
};
