import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useCreateOrgForm, useOrgForms } from "@/features/form/hooks/useOrgForms";
import { AdminLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, LoadingSpinner, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminFormsPage.module.css";
import { StatusTag, type StatusVariant } from "./StatusTag";
import { TabButtons } from "./TabButtons";

interface FormRow {
	id: string;
	title: string;
	lastEdited: string;
	status: StatusVariant;
	deadline: string;
}

const formatDate = (isoDate: string): string => {
	const date = new Date(isoDate);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

const toStatusVariant = (status: string, deadline: string | null | undefined): StatusVariant => {
	if (deadline) {
		const deadlineDate = new Date(deadline);
		const now = new Date();
		if (deadlineDate < now) {
			return "done";
		}
	}
	if (status === "PUBLISHED") {
		return "published";
	}
	return "draft";
};

const toFormRow = (form: FormsForm): FormRow => ({
	id: form.id,
	title: form.title,
	lastEdited: formatDate(form.updatedAt),
	status: toStatusVariant(form.status, form.deadline),
	deadline: form.deadline ? formatDate(form.deadline) : "-"
});

export const AdminFormsPage = () => {
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const [activeTab, setActiveTab] = useState("all");
	const meta = useSeo({ rule: SEO_CONFIG.adminForms });

	// Fetch forms from API
	const orgSlug = useActiveOrgSlug();
	const formsQuery = useOrgForms(orgSlug);
	const createFormMutation = useCreateOrgForm(orgSlug);

	useEffect(() => {
		if (formsQuery.error) pushToast({ title: "無法載入表單列表", description: (formsQuery.error as Error).message, variant: "error" });
	}, [formsQuery.error]); // eslint-disable-line react-hooks/exhaustive-deps

	// Transform API data to UI model
	const forms: FormRow[] = useMemo(() => {
		if (!formsQuery.data) return [];
		return formsQuery.data.map(toFormRow);
	}, [formsQuery.data]);

	// Filter forms based on active tab
	const filteredForms = useMemo(() => {
		if (activeTab === "all") return forms;
		return forms.filter(form => form.status === activeTab);
	}, [forms, activeTab]);

	const handleFormClick = (formId: string) => {
		navigate(`/orgs/${orgSlug}/forms/${formId}/info`);
	};

	const handleCreateForm = () => {
		createFormMutation.mutate(
			{
				title: "未命名表單",
				description: "",
				messageAfterSubmission: "感謝您的填寫！",
				visibility: "PUBLIC"
			},
			{
				onSuccess: newForm => {
					navigate(`/orgs/${orgSlug}/forms/${newForm.id}/info`);
				},
				onError: error => {
					pushToast({
						title: "錯誤",
						description: error.message || "建立表單失敗",
						variant: "error"
					});
				}
			}
		);
	};

	return (
		<AdminLayout>
			{meta}
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>表單</h1>
					<div className={styles.options}>
						<TabButtons
							tabs={[
								{ value: "all", label: "所有表單" },
								{ value: "draft", label: "草稿" },
								{ value: "published", label: "已發布" },
								{ value: "done", label: "已截止" }
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
						<Button icon={Plus} onClick={handleCreateForm} processing={createFormMutation.isPending}>
							建立表單
						</Button>
					</div>
				</div>

				{formsQuery.isLoading ? (
					<LoadingSpinner />
				) : filteredForms.length > 0 ? (
					<div className={styles.grid}>
						{filteredForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<div className={styles.cardHeader}>
									<h4 className={styles.cardTitle}>{form.title}</h4>
									<StatusTag variant={form.status} showDot />
								</div>
								<div className={styles.cardInfo}>
									<span>最後編輯：{form.lastEdited}</span>
									<span>截止日期：{form.deadline}</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={styles.empty}>
						<p>尚未建立任何表單</p>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};
