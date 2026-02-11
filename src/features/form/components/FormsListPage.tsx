import { useLogout, useMe } from "@/features/auth/hooks/useAuth";
import { useCreateFormResponse, useMyForms } from "@/features/form/hooks/useMyForms";
import { UserLayout } from "@/layouts";
import { Button, Toast } from "@/shared/components";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import type { UnitUserForm } from "@nycu-sdc/core-system-sdk";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FormsListPage.module.css";
import { TabButtons } from "./TabButtons";

/* ---------- API Data → UI Model ---------- */
type TabStatus = "pending" | "inProgress" | "submitted";

type FormRow = {
	id: string;
	title: string;
	deadline: string;
	status: TabStatus;
	apiStatus: string; // Original API status for logic
	buttonLabel: string;
	responseIds?: string[];
};

// Map API status to UI tab status and button label
const statusMap: Record<string, { tab: TabStatus; button: string }> = {
	NOT_STARTED: { tab: "pending", button: "開始填寫" },
	IN_PROGRESS: { tab: "inProgress", button: "繼續填寫" },
	COMPLETED: { tab: "submitted", button: "查看" }
};

const formatDate = (isoDate: string): string => {
	const date = new Date(isoDate);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

const toFormRow = (form: UnitUserForm): FormRow => {
	const mapped = statusMap[form.status] ?? { tab: "pending", button: "開始填寫" };
	return {
		id: form.id,
		title: form.title,
		deadline: formatDate(form.deadline),
		status: mapped.tab,
		apiStatus: form.status,
		buttonLabel: mapped.button,
		responseIds: form.responseIds
	};
};

export const FormsListPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabStatus>("pending");
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	// Fetch current user
	const meQuery = useMe();
	const logoutMutation = useLogout();

	// Fetch forms from API
	const formsQuery = useMyForms();
	const createResponseMutation = useCreateFormResponse();

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => navigate("/"),
			onError: error => {
				setToastMessage(error.message || "Failed to logout");
				setToastOpen(true);
			}
		});
	};

	// Transform API data to UI model
	const forms: FormRow[] = useMemo(() => {
		if (!formsQuery.data) return [];
		return formsQuery.data.map(toFormRow);
	}, [formsQuery.data]);

	// Filter forms based on active tab
	const filteredForms = useMemo(() => {
		return forms.filter(form => form.status === activeTab);
	}, [forms, activeTab]);

	const handleFormClick = (form: FormRow) => {
		if (form.apiStatus === "NOT_STARTED") {
			// Create form response first, then navigate with the new response id
			createResponseMutation.mutate(form.id, {
				onSuccess: data => {
					navigate(`/forms/${data.id}`);
				},
				onError: error => {
					setToastMessage(error.message || "Failed to start form");
					setToastOpen(true);
				}
			});
		} else {
			// Already started or completed, navigate with the first response id
			const responseId = form.responseIds?.[0];
			if (responseId) {
				navigate(`/forms/${responseId}`);
			}
		}
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>我的表單</h1>
					<p className={styles.subtitle}>
						不是 {meQuery.data?.name} 嗎？{" "}
						<span onClick={handleLogout} className={styles.logoutLink}>
							（<span className={styles.logoutText}>登出</span>）
						</span>
					</p>
				</div>

				{formsQuery.isError && <ErrorMessage message={(formsQuery.error as Error)?.message || "Failed to load forms"} />}

				<div className={styles.list}>
					<TabButtons
						tabs={[
							{ value: "pending", label: "待填寫" },
							{ value: "inProgress", label: "填寫中" },
							{ value: "submitted", label: "已送出" }
						]}
						activeTab={activeTab}
						onTabChange={value => setActiveTab(value as TabStatus)}
					/>

					{formsQuery.isLoading ? (
						<LoadingSpinner />
					) : filteredForms.length > 0 ? (
						filteredForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form)}>
								<div className={styles.cardInfo}>
									<h3 className={styles.cardTitle}>{form.title}</h3>
									<p className={styles.cardDescription}>截止日期：{form.deadline}</p>
								</div>
								<Button className={styles.sharedBtn} processing={createResponseMutation.isPending}>
									{form.buttonLabel}
								</Button>
							</div>
						))
					) : (
						<p className={styles.empty}>
							{activeTab === "pending" && "您沒有待填寫的表單。"}
							{activeTab === "inProgress" && "您沒有填寫中的表單。"}
							{activeTab === "submitted" && "您沒有已送出的表單。"}
						</p>
					)}
				</div>

				<Toast open={toastOpen} onOpenChange={setToastOpen} title="Error" description={toastMessage} variant="error" />
			</div>
		</UserLayout>
	);
};
