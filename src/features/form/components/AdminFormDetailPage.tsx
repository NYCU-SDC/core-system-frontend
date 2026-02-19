import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useFormById } from "@/features/form/hooks/useOrgForms";
import { AdminLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { LoadingSpinner } from "@/shared/components";
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
	const location = useLocation();
	const navigate = useNavigate();

	// Extract tab from pathname
	const pathParts = location.pathname.split("/");
	const currentTab = pathParts[pathParts.length - 1] as TabType;

	const [activeTab, setActiveTab] = useState<TabType>(currentTab || "info");

	// Fetch form data
	const formQuery = useFormById(formid);
	const meta = useSeo({ rule: SEO_CONFIG.adminForms });

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		navigate(`/orgs/${orgSlug}/forms/${formid}/${tab}`);
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
					<p>無法載入表單資料</p>
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
