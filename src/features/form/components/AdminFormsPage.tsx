import { AdminLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminFormsPage.module.css";
import { StatusTag, type StatusVariant } from "./StatusTag";
import { TabButtons } from "./TabButtons";

// Mock data
const mockForms: { id: string; title: string; lastEdited: string; responses: number; status: StatusVariant; deadline: string }[] = [
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
						<TabButtons
							tabs={[
								{ value: "all", label: "所有表單" },
								{ value: "published", label: "草稿" },
								{ value: "draft", label: "已發布" },
								{ value: "ended", label: "已截止" }
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
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
									<StatusTag variant={form.status} showDot />
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
