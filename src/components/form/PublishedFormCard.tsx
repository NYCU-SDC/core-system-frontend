import React from 'react'
import type { FormCardProps } from "@/types/forms.ts";
import "./DraftFormCard.css"
import { useNavigate } from 'react-router-dom';

const PublishedFormCard: React.FC<FormCardProps> = ({
	form,
	slug
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
		navigate(`/${slug}/forms/results/${id}`);
	};

	const getDisplayUnits = () => {
		const formUnits = form.unitId || [];
		const units = Array.isArray(formUnits) ? formUnits : [formUnits].filter(Boolean);

		if (units.length === 0) {
			return 'No units';
		}

		if (units.length === 1) {
			return units[0];
		}

		return `${units.length} units`;
	};

	return (
		<div className="draft-form-card">
			<div className="card-header">
				<div className="form-title">{form.title}</div>
				<div className="form-unit">{getDisplayUnits()}</div>
			</div>
			<div className="card-body">
				<div className="form-description">{form.description}</div>
			</div>
			<div className="card-footer">
				<div className="form-time">
					<label>Published at </label>
					<span>{formatDate(form.updatedAt)}</span>
				</div>
				<div className="form-actions">
					<button className="btn btn-secondary" onClick={()=>handleViewResult(form.id)}>View Result</button>
				</div>
			</div>
		</div>
	)
}

export default PublishedFormCard;