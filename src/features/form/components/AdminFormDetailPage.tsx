import { AdminLayout } from "@/layouts";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./AdminFormDetailPage.module.css";
import { AdminFormDesignPage } from "./AdminFormDetailPages/DesignPage";
import { AdminFormEditPage } from "./AdminFormDetailPages/EditPage";
import { AdminFormInfoPage } from "./AdminFormDetailPages/InfoPage";
import { AdminSectionEditPage } from "./AdminFormDetailPages/SectionEditPage";

type TabType = "info" | "edit" | "reply" | "design";

export const AdminFormDetailPage = () => {
	const { formid, sectionId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();

	// Extract tab from pathname
	const pathParts = location.pathname.split("/");
	const currentTab = pathParts[pathParts.length - 1] as TabType;

	const [activeTab, setActiveTab] = useState<TabType>(currentTab || "info");

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		navigate(`/orgs/sdc/forms/${formid}/${tab}`);
	};

	return (
		<AdminLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Form: {formid}</h1>
				</div>

				<div className={styles.tabs}>
					<button className={`${styles.tab} ${activeTab === "info" ? styles.active : ""}`} onClick={() => handleTabChange("info")}>
						Info
					</button>
					<button className={`${styles.tab} ${activeTab === "edit" ? styles.active : ""}`} onClick={() => handleTabChange("edit")}>
						Edit
					</button>
					<button className={`${styles.tab} ${activeTab === "reply" ? styles.active : ""}`} onClick={() => handleTabChange("reply")}>
						Replies
					</button>
					<button className={`${styles.tab} ${activeTab === "design" ? styles.active : ""}`} onClick={() => handleTabChange("design")}>
						Design
					</button>
				</div>

				<div className={styles.content}>
					{activeTab === "info" && (
						<div className={styles.info}>
							<AdminFormInfoPage />
						</div>
					)}
					{activeTab === "edit" && !sectionId && (
						<div className={styles.edit}>
							<AdminFormEditPage />
						</div>
					)}
					{activeTab === "edit" && sectionId && (
						<div className={styles.edit}>
							<AdminSectionEditPage />
						</div>
					)}
					{activeTab === "reply" && <div>Reply Page Content</div>}
					{activeTab === "design" && (
						<div className={styles.design}>
							<AdminFormDesignPage />
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
};
