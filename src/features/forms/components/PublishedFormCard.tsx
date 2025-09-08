import React from 'react'
import type { FormCardProps } from "@/types/form.ts";
import "./DraftFormCard.css"
import { useNavigate } from 'react-router-dom';

const PublishedFormCard: React.FC<FormCardProps> = ({
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

	const handleViewResult = (id: string) => {
		console.log('View Result:', id);
		navigate(`/forms/results/${id}`);
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
					<label>Published at </label>
					<span>{formatDate(form.time)}</span>
				</div>
				<div className="form-actions">
					<button className="btn btn-secondary" onClick={()=>handleViewResult(form.id)}>View Result</button>
				</div>
			</div>
		</div>
	)
}

export default PublishedFormCard;