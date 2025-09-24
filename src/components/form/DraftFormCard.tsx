import React from 'react'
import type { FormCardProps } from "@/types/forms.ts";
import "./DraftFormCard.css"
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishForm } from "@/lib/request/publishForm.ts";
import { useGetOrganization } from "@/hooks/useGetOrganization.ts";

const DraftFormCard: React.FC<FormCardProps> = ({
	form,
}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { data: organization } = useGetOrganization(orgSlug || '');

	const publishMutation = useMutation({
		mutationFn: (data: {id: string; request: {orgId: string; unitIds: string[]}})=>
			publishForm(data.id, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['forms'] });
			alert("Form published successfully!");
		},
		onError: (error) => {
			console.error("Failed to publish form:", error);
			alert("Failed to publish form. Please try again.");
		},
	})

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
			//const formUnits = form.unitId || [];
			const unitIds = Array.isArray(form.unitId) ? form.unitId : [form.unitId].filter(Boolean);

			await publishMutation.mutateAsync({
				id,
				request: {
					orgId: organization.id,
					unitIds: unitIds
				}
			});
		} catch (error) {
			console.error("Publish error:", error);
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
					<button className="btn btn-secondary" onClick={()=>handlePublish(form.id)} disabled={publishMutation.isPending}>
						{publishMutation.isPending ? 'Publishing...' : 'Publish'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default DraftFormCard;