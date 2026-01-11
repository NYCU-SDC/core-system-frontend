import { AdminLayout } from "@/layouts";
import { Button } from "@/shared/components";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminFormsPage.module.css";

// Mock data
const mockForms = [
	{
		id: "form-1",
		title: "Survey Form",
		description: "Customer satisfaction survey",
		responses: 45,
		status: "Active"
	},
	{
		id: "form-2",
		title: "Feedback Form",
		description: "Product feedback collection",
		responses: 32,
		status: "Active"
	}
];

export const AdminFormsPage = () => {
	const navigate = useNavigate();

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
					<h1 className={styles.title}>Forms Management</h1>
					<Button icon={Plus} onClick={handleCreateForm}>
						Create Form
					</Button>
				</div>

				{mockForms.length > 0 ? (
					<div className={styles.grid}>
						{mockForms.map(form => (
							<div key={form.id} className={styles.card} onClick={() => handleFormClick(form.id)}>
								<div className={styles.cardHeader}>
									<div>
										<h3 className={styles.cardTitle}>{form.title}</h3>
										<div className={styles.cardMeta}>
											<span>{form.responses} responses</span>
											<span>{form.status}</span>
										</div>
									</div>
								</div>
								<p className={styles.cardDescription}>{form.description}</p>
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
