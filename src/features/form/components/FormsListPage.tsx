import { UserLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FormsListPage.module.css";

// Mock data
const mockForms = [
	{
		id: "1",
		title: "Survey Form",
		description: "Complete this survey to help us improve",
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
	}
];

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
						<div className={styles.btnList}>
							<button className={`${styles.btn} ${activeTab === "pending" ? styles.btnActive : ""}`} onClick={() => setActiveTab("pending")}>
								待填寫
							</button>
							<button className={`${styles.btn} ${activeTab === "inProgress" ? styles.btnActive : ""}`} onClick={() => setActiveTab("inProgress")}>
								填寫中
							</button>
							<button className={`${styles.btn} ${activeTab === "submitted" ? styles.btnActive : ""}`} onClick={() => setActiveTab("submitted")}>
								已送出
							</button>
						</div>
						{mockForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<div className={styles.cardInfo}>
									<h3 className={styles.cardTitle}>{form.title}</h3>
									<p className={styles.cardDescription}>{form.description}</p>
								</div>
								<Button>{form.option}</Button>
							</div>
						))}
					</div>
				) : (
					<div className={styles.empty}>
						<p>No forms available at the moment</p>
					</div>
				)}
			</div>
		</UserLayout>
	);
};
