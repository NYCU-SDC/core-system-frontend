import * as api from "@/features/dashboard/services/api";
import type { UnitUserForm } from "@nycu-sdc/core-system-sdk";
import { useQuery } from "@tanstack/react-query";

// Toggle: true = mock data, false = real API
const USE_MOCK_DATA = true;

const mockMyForms: UnitUserForm[] = [
	// NOT_STARTED (待填寫)
	{
		id: "form-001",
		title: "114 學年度社團幹部登記表",
		deadline: "2025-03-15T23:59:59Z",
		status: "NOT_STARTED" as UnitUserForm["status"]
	},
	{
		id: "form-002",
		title: "程式設計課程意見調查",
		deadline: "2025-02-28T23:59:59Z",
		status: "NOT_STARTED" as UnitUserForm["status"]
	},
	// IN_PROGRESS (填寫中)
	{
		id: "form-003",
		title: "Full Stack 培訓報名表",
		deadline: "2025-03-01T23:59:59Z",
		status: "IN_PROGRESS" as UnitUserForm["status"]
	},
	{
		id: "form-004",
		title: "社課回饋問卷 - 11/5",
		deadline: "2025-02-20T23:59:59Z",
		status: "IN_PROGRESS" as UnitUserForm["status"]
	},
	// COMPLETED (已送出)
	{
		id: "form-005",
		title: "期中活動滿意度調查",
		deadline: "2025-01-15T23:59:59Z",
		status: "COMPLETED" as UnitUserForm["status"]
	},
	{
		id: "form-006",
		title: "113 學年度社員資料更新",
		deadline: "2024-12-31T23:59:59Z",
		status: "COMPLETED" as UnitUserForm["status"]
	}
];

/**
 * Hook to fetch forms assigned to the current user
 *
 * @returns React Query result with user's forms, loading state, and error state
 */
export const useMyForms = () =>
	useQuery({
		queryKey: ["forms", "me"],
		queryFn: () => (USE_MOCK_DATA ? Promise.resolve(mockMyForms) : api.listMyForms())
	});
