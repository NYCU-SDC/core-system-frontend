import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useFormById, usePublishForm } from "@/features/form/hooks/useOrgForms";
import { AdminLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, ErrorMessage, LoadingSpinner, SpinningIcon, useToast } from "@/shared/components";
import { useIsMutating } from "@tanstack/react-query";
import { Check, Link, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./AdminFormDetailPage.module.css";
import { AdminFormDesignPage } from "./AdminFormDetailPages/DesignPage";
import { AdminFormEditPage } from "./AdminFormDetailPages/EditPage";
import { AdminFormInfoPage } from "./AdminFormDetailPages/InfoPage";
import { AdminFormRepliesPage } from "./AdminFormDetailPages/RepliesPage";
import { AdminSectionEditPage } from "./AdminFormDetailPages/SectionEditPage";

type TabType = "info" | "edit" | "reply" | "design";

export const AdminFormDetailPage = () => {
	const { formid, sectionId } = useParams();
	const orgSlug = useActiveOrgSlug();
	const { pushToast } = useToast();
	const location = useLocation();
	const navigate = useNavigate();

	// Extract tab from pathname
	const pathParts = location.pathname.split("/");
	const currentTab = pathParts[pathParts.length - 1] as TabType;

	const [activeTab, setActiveTab] = useState<TabType>(currentTab || "info");

	// Fetch form data
	const formQuery = useFormById(formid);
	const publishFormMutation = usePublishForm(orgSlug);
	const meta = useSeo({ rule: SEO_CONFIG.adminFormDetail, data: formQuery.data });
	const activeEditorMutations = useIsMutating({ mutationKey: ["form-editor", formid ?? ""] });
	const isSaving = activeEditorMutations > 0;

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		navigate(`/orgs/${orgSlug}/forms/${formid}/${tab}`);
	};

	const handlePublish = () => {
		if (!formid) return;
		publishFormMutation.mutate(formid, {
			onSuccess: () => {
				pushToast({ title: "已發布", variant: "success" });
				formQuery.refetch();
			},
			onError: error => pushToast({ title: "發布失敗", description: (error as Error).message, variant: "error" })
		});
	};

	const handleViewForm = () => {
		if (!formid) return;
		window.open(`/forms/${formid}`, "_blank", "noopener,noreferrer");
	};

	const handleCopyFormLink = async () => {
		if (!formid) return;
		const formUrl = `${window.location.origin}/forms/${formid}`;
		try {
			await navigator.clipboard.writeText(formUrl);
			pushToast({ title: "已複製填寫連結", variant: "success" });
		} catch {
			pushToast({ title: "複製失敗", variant: "error" });
		}
	};

	if (formQuery.isLoading) {
		return (
			<AdminLayout>
				{meta}
				<div className={styles.container}>
					<LoadingSpinner />
				</div>
			</AdminLayout>
		);
	}

	if (formQuery.isError || !formQuery.data) {
		return (
			<AdminLayout>
				{meta}
				<div className={styles.container}>
					<ErrorMessage message={(formQuery.error as Error)?.message ?? "找不到表單"} />
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			{meta}
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>{formQuery.data.title}</h1>
					<div className={styles.headerActions}>
						<div className={styles.saveStatus} aria-live="polite">
							{isSaving ? <SpinningIcon icon={LoaderCircle} size={16} /> : <Check size={16} />}
							<span>{isSaving ? "儲存中" : "已儲存"}</span>
						</div>
						<Button onClick={handlePublish} disabled={publishFormMutation.isPending || formQuery.data.status !== "DRAFT"}>
							{formQuery.data.status === "DRAFT" ? "立即發佈表單" : "已發布"}
						</Button>
						{formQuery.data.status === "DRAFT" ? (
							<Button variant="secondary" onClick={() => window.open(`/orgs/${orgSlug}/forms/${formid}/preview`, "_blank", "noopener,noreferrer")}>
								預覽表單（beta）
							</Button>
						) : (
							<>
								<Button variant="secondary" onClick={handleViewForm}>
									檢視表單
								</Button>
								<Button variant="secondary" onClick={handleCopyFormLink} title="點擊按鈕以複製表單連結">
									<Link size={16} />
								</Button>
							</>
						)}
					</div>
				</div>

				<div className={styles.tabs}>
					<button className={`${styles.tab} ${activeTab === "info" ? styles.active : ""}`} onClick={() => handleTabChange("info")}>
						資訊
					</button>
					<button className={`${styles.tab} ${activeTab === "edit" ? styles.active : ""}`} onClick={() => handleTabChange("edit")}>
						編輯
					</button>
					<button className={`${styles.tab} ${activeTab === "reply" ? styles.active : ""}`} onClick={() => handleTabChange("reply")}>
						回覆
					</button>
					<button className={`${styles.tab} ${activeTab === "design" ? styles.active : ""}`} onClick={() => handleTabChange("design")}>
						設計
					</button>
				</div>

				<div className={styles.content}>
					{activeTab === "info" && (
						<div className={styles.info}>
							<AdminFormInfoPage formData={formQuery.data} />
						</div>
					)}
					{activeTab === "edit" && !sectionId && (
						<div className={styles.edit}>
							<AdminFormEditPage formData={formQuery.data} />
						</div>
					)}
					{activeTab === "edit" && sectionId && (
						<div className={styles.edit}>
							<AdminSectionEditPage />
						</div>
					)}
					{activeTab === "reply" && (
						<div className={styles.replies}>
							<AdminFormRepliesPage formData={formQuery.data} />
						</div>
					)}
					{activeTab === "design" && (
						<div className={styles.design}>
							<AdminFormDesignPage formData={formQuery.data} />
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
};
