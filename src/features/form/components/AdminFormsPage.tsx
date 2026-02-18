import { useArchiveForm, useCreateOrgForm, useDeleteForm, useOrgForms, usePublishForm } from "@/features/form/hooks/useOrgForms";
import { AdminLayout } from "@/layouts";
import { Button, ErrorMessage, LoadingSpinner, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { Archive, Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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

	// Fetch forms from API
	const orgSlug = "sdc";
	const formsQuery = useOrgForms(orgSlug);
	const createFormMutation = useCreateOrgForm(orgSlug);
	const publishFormMutation = usePublishForm(orgSlug);
	const archiveFormMutation = useArchiveForm(orgSlug);
	const deleteFormMutation = useDeleteForm(orgSlug);

	const handlePublish = (e: React.MouseEvent, formId: string) => {
		e.stopPropagation();
		publishFormMutation.mutate(formId, {
			onSuccess: () => pushToast({ title: "已發布", variant: "success" }),
			onError: () => pushToast({ title: "發布失敗", variant: "error" })
		});
	};

	const handleArchive = (e: React.MouseEvent, formId: string) => {
		e.stopPropagation();
		archiveFormMutation.mutate(formId, {
			onSuccess: () => pushToast({ title: "已封存", variant: "success" }),
			onError: () => pushToast({ title: "封存失敗", variant: "error" })
		});
	};

	const handleDelete = (e: React.MouseEvent, formId: string) => {
		e.stopPropagation();
		if (!confirm("確定要刪除此表單？此操作無法復原。")) return;
		deleteFormMutation.mutate(formId, {
			onSuccess: () => pushToast({ title: "已刪除", variant: "success" }),
			onError: () => pushToast({ title: "刪除失敗", variant: "error" })
		});
	};

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
		navigate(`/orgs/sdc/forms/${formId}/info`);
	};

	const handleCreateForm = () => {
		createFormMutation.mutate(
			{
				title: "未命名表單",
				description: "",
				messageAfterSubmission: "感謝您的填寫！"
			},
			{
				onSuccess: newForm => {
					navigate(`/orgs/sdc/forms/${newForm.id}/info`);
				},
				onError: error => {
					pushToast({
						title: "Error",
						description: error.message || "Failed to create form",
						variant: "error"
					});
				}
			}
		);
	};

	return (
		<AdminLayout>
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

				{formsQuery.isError && <ErrorMessage message={(formsQuery.error as Error)?.message || "Failed to load forms"} />}

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
									<span>Last edited: {form.lastEdited}</span>
									<span>Deadline: {form.deadline}</span>
								</div>
								<div className={styles.cardActions} onClick={e => e.stopPropagation()}>
									{form.status === "draft" && (
										<Button variant="primary" onClick={e => handlePublish(e, form.id)} disabled={publishFormMutation.isPending}>
											<Send size={14} />
											發布
										</Button>
									)}
									{form.status !== "done" && (
										<Button onClick={e => handleArchive(e, form.id)} disabled={archiveFormMutation.isPending}>
											<Archive size={14} />
											封存
										</Button>
									)}
									<Button variant="danger" onClick={e => handleDelete(e, form.id)} disabled={deleteFormMutation.isPending}>
										<Trash2 size={14} />
										刪除
									</Button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={styles.empty}>
						<p>No forms created yet</p>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};
