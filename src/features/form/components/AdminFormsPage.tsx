import { AdminLayout } from "@/layouts";
import { Badge, Button } from "@/shared/components";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminFormsPage.module.css";

type FormStatus = "published" | "draft" | "done";

const statusConfig: Record<FormStatus, { label: string; className: string }> = {
	published: { label: "已發佈", className: styles.badgePublished },
	draft: { label: "草稿", className: styles.badgeDraft },
	done: { label: "已結束", className: styles.badgeDone }
};

// Mock data
const mockForms: { id: string; title: string; lastEdited: string; responses: number; status: FormStatus; deadline: string }[] = [
	{
		id: "form-1",
		title: "114 fall Full-stack intro training advanced",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "published",
		deadline: "2025/12/31"
	},
	{
		id: "form-2",
		title: "114 fall Full-stack intro training advancedddddddddddd",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "draft",
		deadline: "2025/12/31"
	},
	{
		id: "form-3",
		title: "Full Stack Intro 11/5 課程回饋",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "draft",
		deadline: "2025/12/31"
	},
	{
		id: "form-4",
		title: "Full Stack Intro 11/5 課程回饋",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "done",
		deadline: "2025/12/31"
	},
	{
		id: "form-5",
		title: "114 fall Full-stack intro training advanced",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "published",
		deadline: "2025/12/31"
	},
	{
		id: "form-6",
		title: "114 fall Full-stack intro training advanced",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "draft",
		deadline: "2025/12/31"
	},
	{
		id: "form-7",
		title: "Full Stack Intro 11/5 課程回饋",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "draft",
		deadline: "2025/12/31"
	},
	{
		id: "form-8",
		title: "Full Stack Intro 11/5 課程回饋",
		lastEdited: "2025/12/25",
		responses: 5,
		status: "done",
		deadline: "2025/12/31"
	}
];

export const AdminFormsPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("all");

	const handleFormClick = (formId: string) => {
		navigate(`/orgs/sdc/forms/${formId}/info`);
	};

	const handleCreateForm = () => {
		console.log("Create new form");
	};

	return (
		<AdminLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>表單</h1>
					<div className={styles.options}>
						<div className={styles.btnList}>
							<button className={`${styles.btn} ${activeTab === "all" ? styles.btnActive : ""}`} onClick={() => setActiveTab("all")}>
								所有表單
							</button>
							<button className={`${styles.btn} ${activeTab === "published" ? styles.btnActive : ""}`} onClick={() => setActiveTab("published")}>
								草稿
							</button>
							<button className={`${styles.btn} ${activeTab === "draft" ? styles.btnActive : ""}`} onClick={() => setActiveTab("draft")}>
								已發布
							</button>
							<button className={`${styles.btn} ${activeTab === "ended" ? styles.btnActive : ""}`} onClick={() => setActiveTab("ended")}>
								已截止
							</button>
						</div>
						<Button icon={Plus} onClick={handleCreateForm}>
							建立表單
						</Button>
					</div>
				</div>

				{mockForms.length > 0 ? (
					<div className={styles.grid}>
						{mockForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<div className={styles.cardHeader}>
									<h3 className={styles.cardTitle}>{form.title}</h3>
									<Badge className={statusConfig[form.status].className} showDot>
										{statusConfig[form.status].label}
									</Badge>
								</div>
								<div className={styles.cardInfo}>
									<span>Last edited: {form.lastEdited}</span>
									<span>{form.responses} responses</span>
									<span>Deadline: {form.deadline}</span>
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
