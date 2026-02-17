import { useOrgAdminAccess } from "@/features/auth/hooks/useOrgAdminAccess";
import type { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";
import { UserLayout } from "./UserLayout";

interface SmartLayoutProps {
	children: ReactNode;
}

export const SmartLayout = ({ children }: SmartLayoutProps) => {
	const { canAccessOrgAdmin } = useOrgAdminAccess();

	if (canAccessOrgAdmin) {
		return <AdminLayout>{children}</AdminLayout>;
	}

	return <UserLayout>{children}</UserLayout>;
};
