import { useNavigate, useParams } from "react-router-dom";

export const AdminFormEditPage = () => {
	const { formid } = useParams();
	const navigate = useNavigate();

	const handleEditForm = (sectionId: string) => {
		navigate(`/orgs/sdc/forms/${formid}/section/${sectionId}/edit`);
	};

	return (
		<>
			<div>Section Edit Page Content</div>
			<button onClick={() => handleEditForm("test")}>Edit Form</button>
		</>
	);
};
