import { UserLayout } from "@/layouts";
import { useNavigate } from "react-router-dom";
import styles from "./FormsListPage.module.css";

// Mock data
const mockForms = [
	{
		id: "1",
		title: "Survey Form",
		description: "Complete this survey to help us improve"
	},
	{
		id: "2",
		title: "Feedback Form",
		description: "Share your feedback with us"
	}
];

export const FormsListPage = () => {
	const navigate = useNavigate();

	const handleFormClick = (formId: string) => {
		navigate(`/forms/${formId}`);
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Available Forms</h1>
					<p className={styles.subtitle}>Select a form to fill out</p>
				</div>

				{mockForms.length > 0 ? (
					<div className={styles.list}>
						{mockForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<h3 className={styles.cardTitle}>{form.title}</h3>
								<p className={styles.cardDescription}>{form.description}</p>
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
