import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import styles from "./AdminFormDetailPage.module.css";

type TabType = "info" | "edit" | "reply" | "design";

export function AdminFormDetailPage() {
	const { formid } = useParams();
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
					<div className={styles.placeholder}>
						<p>Content for {activeTab} tab</p>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
