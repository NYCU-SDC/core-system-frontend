import { UserLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FormsListPage.module.css";
import { TabButtons } from "./TabButtons";

// Mock data
const mockForms = [
	{
		id: "1",
		title: "三級標題 Heading 3",
		description: "死線：2025/5/12",
		option: "開始填寫"
	},
	{
		id: "2",
		title: "Feedback Form",
		description: "Share your feedback with us",
		option: "繼續填寫"
	},
	{
		id: "3",
		title: "Feedback Form",
		description: "Share your feedback with us",
		option: "編輯"
	},
	{
		id: "4",
		title: "Feedback Form",
		description: "Share your feedback with us",
		option: "編輯"
	},
	{
		id: "5",
		title: "Feedback Form",
		description: "Share your feedback with us",
		option: "編輯"
	}
];
// const mockForms=[];

export const FormsListPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("pending");

	const handleFormClick = (formId: string) => {
		navigate(`/forms/${formId}`);
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>NYCU SDC 的表單</h1>
					<p className={styles.subtitle}>不是 info@elvismao.com 嗎？（登出）</p>
				</div>

				{mockForms.length > 0 ? (
					<div className={styles.list}>
						<TabButtons
							tabs={[
								{ value: "pending", label: "待填寫" },
								{ value: "inProgress", label: "填寫中" },
								{ value: "submitted", label: "已送出" }
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
						{mockForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<div className={styles.cardInfo}>
									<h3 className={styles.cardTitle}>{form.title}</h3>
									<p className={styles.cardDescription}>{form.description}</p>
								</div>
								<Button className={styles.sharedBtn}>{form.option}</Button>
							</div>
						))}
					</div>
				) : (
					<div className={styles.list}>
						<TabButtons
							tabs={[
								{ value: "inProgress", label: "填寫中" },
								{ value: "submitted", label: "已送出" }
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
						<p className={styles.empty}>您沒有填寫中的表單。</p>
					</div>
				)}
			</div>
		</UserLayout>
	);
};
