import { useLogout, useMe } from "@/features/auth/hooks/useAuth";
import { useCreateFormResponse, useMyForms } from "@/features/form/hooks/useMyForms";
import { UserLayout } from "@/layouts";
import { Button, Toast } from "@/shared/components";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { UnitUserFormStatus, type UnitUserForm } from "@nycu-sdc/core-system-sdk";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FormsListPage.module.css";
import { TabButtons } from "./TabButtons";

/* ---------- API Data → UI Model ---------- */
type FormRow = {
	id: string;
	title: string;
	deadline: string;
	status: (typeof UnitUserFormStatus)[keyof typeof UnitUserFormStatus];
	buttonLabel: string;
	responseIds?: string[];
};

// Map API status to button label
const statusMap: Record<(typeof UnitUserFormStatus)[keyof typeof UnitUserFormStatus], string> = {
	[UnitUserFormStatus.NOT_STARTED]: "開始填寫",
	[UnitUserFormStatus.IN_PROGRESS]: "繼續填寫",
	[UnitUserFormStatus.COMPLETED]: "查看"
};

const formatDate = (isoDate: string): string => {
	const date = new Date(isoDate);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

const toFormRow = (form: UnitUserForm): FormRow => {
	return {
		id: form.id,
		title: form.title,
		deadline: formatDate(form.deadline),
		status: form.status,
		buttonLabel: statusMap[form.status],
		responseIds: form.responseIds
	};
};

export const FormsListPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<(typeof UnitUserFormStatus)[keyof typeof UnitUserFormStatus]>(UnitUserFormStatus.NOT_STARTED);
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
		if (form.status === UnitUserFormStatus.NOT_STARTED) {
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
							{ value: UnitUserFormStatus.NOT_STARTED, label: "待填寫" },
							{ value: UnitUserFormStatus.IN_PROGRESS, label: "填寫中" },
							{ value: UnitUserFormStatus.COMPLETED, label: "已送出" }
						]}
						activeTab={activeTab}
						onTabChange={value => setActiveTab(value as (typeof UnitUserFormStatus)[keyof typeof UnitUserFormStatus])}
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
							{activeTab === UnitUserFormStatus.NOT_STARTED && "您沒有待填寫的表單。"}
							{activeTab === UnitUserFormStatus.IN_PROGRESS && "您沒有填寫中的表單。"}
							{activeTab === UnitUserFormStatus.COMPLETED && "您沒有已送出的表單。"}
						</p>
					)}
				</div>

				<Toast open={toastOpen} onOpenChange={setToastOpen} title="Error" description={toastMessage} variant="error" />
			</div>
		</UserLayout>
	);
};
