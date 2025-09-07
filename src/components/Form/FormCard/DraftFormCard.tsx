import React from 'react'
import type { FormCardProps } from '@/types/form';
import "./DraftFormCard.css"
import { useNavigate } from 'react-router-dom';

const DraftFormCard: React.FC<FormCardProps> = ({
	form
}) => {
	const navigate = useNavigate();

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

	const handlePublish = (id: string) => {
		console.log('Published:', id);
	};

	return (
		<div className="draft-form-card">
			<div className="card-header">
				<div className="form-title">{form.title}</div>
				<div className="form-unit">{form.unit}</div>
			</div>
			<div className="card-body">
				<div className="form-description">{form.description}</div>
			</div>
			<div className="card-footer">
				<div className="form-time">
					<label>Created at </label>
					<span>{formatDate(form.time)}</span>
				</div>
				<div className="form-actions">
					<button className="btn btn-primary" onClick={()=>handleEdit(form.id)}>Edit</button>
					<button className="btn btn-secondary" onClick={()=>handlePublish(form.id)}>Publish</button>
				</div>
			</div>
		</div>
	)
}

export default DraftFormCard;