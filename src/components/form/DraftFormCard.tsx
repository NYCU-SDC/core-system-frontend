import React from 'react'
import type { FormCardProps } from "@/types/forms.ts";
import "./DraftFormCard.css"
import { useNavigate } from 'react-router-dom';
import { usePublishFormMutation } from '@/lib/request/form.ts';

const DraftFormCard: React.FC<FormCardProps> = ({
	form,
}) => {
	const navigate = useNavigate();
	const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();
	//const [showPublishModal, setShowPublishModal] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
	};

	const handleEdit = (id: string) => {
		console.log('Edit:', id);
		navigate(`/forms/edit/${id}`);
	};

	const handlePublish = async (id: string) => {
		try {
			const formUnits = form.unitId || [];
			const units = Array.isArray(formUnits) ? formUnits : [formUnits].filter(Boolean);

			await publishForm({
				id,
				recipients: {
					unitIds: units
				}
			}).unwrap();

			console.log("Form published successfully:", id);
			alert("Form published successfully!");

			// Optionally refresh the page or update the UI
			window.location.reload();
		} catch (error) {
			console.error("Failed to publish form:", error);
			alert("Failed to publish form. Please try again.");
		}
	};

	/*const handlePublishClick = (id: string) => {
		// Simple confirmation - in production you might want a proper modal
		if (window.confirm(`Are you sure you want to publish "${form.title}" to ${form.unitId?.join(', ')}?`)) {
			handlePublish(id);
		}
	};*/

	return (
		<div className="draft-form-card">
			<div className="card-header">
				<div className="form-title">{form.title}</div>
				<div className="form-unit">{form.unitId}</div>
			</div>
			<div className="card-body">
				<div className="form-description">{form.description}</div>
			</div>
			<div className="card-footer">
				<div className="form-time">
					<label>Created at </label>
					<span>{formatDate(form.createdAt)}</span>
				</div>
				<div className="form-actions">
					<button className="btn btn-primary" onClick={()=>handleEdit(form.id)}>Edit</button>
					<button className="btn btn-secondary" onClick={()=>handlePublish(form.id)} disabled={isPublishing}>
						{isPublishing ? 'Publishing...' : 'Publish'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default DraftFormCard;