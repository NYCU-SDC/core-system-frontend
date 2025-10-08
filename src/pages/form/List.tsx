import DraftFormCard from "@/components/form/DraftFormCard.tsx";
import PublishedFormCard from "@/components/form/PublishedFormCard.tsx";
//import React from 'react';
//import { Button } from "@/components/ui";
import { useNavigate, useParams } from 'react-router-dom';
import { useGetForms } from '@/hooks/useGetForms';
import { useGetOrganization } from "@/hooks/useGetOrganization.ts";
import { publishForm } from "@/lib/request/publishForm.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const FormList = () => {
	const navigate = useNavigate();
	const { slug } = useParams<{ slug: string }>();
	const { data: organization } = useGetOrganization(slug || '');
	const unitId = organization?.id as string;
	const { data, isError, isLoading, status } = useGetForms(slug || '', unitId);
	const queryClient = useQueryClient();
	//console.log(status);

	// const publishFormMutation = useMutation({
	// 	mutationFn: (data: { id: string; request: { orgId: string; unitIds: string[] } }) =>
	// 		publishForm(data.id, data.request),
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ['Forms'] });
	// 		queryClient.invalidateQueries({ queryKey: ['Form', id] });
	// 		alert('Form published successfully!');
	// 		navigate('/forms');
	// 	},
	// 	onError: (error) => {
	// 		console.error('Failed to publish form:', error);
	// 		alert('Failed to publish form. Please try again.');
	// 	}
	// });

	const handleNewForm = () => {
		console.log('Create new form');
		navigate(`/${slug}/forms/edit/new`);
	};

	const handleEditForm = (id: string) => {
		console.log('Edit form:', id);
		navigate(`/${slug}/forms/edit/${id}`);
	};

	const handleViewResult = (id: string) => {
		console.log('View result:', id);
		navigate(`/${slug}/forms/results/${id}`);
	};

	const handlePublishForm = (id: string) => {
		console.log('Publish form:', id);
		//publishForm(id: id, data: {})
	};

	const safeFormsArray = data || [];
	const draftForms = safeFormsArray.filter(form => form.status === "draft");
	const publishedForms = safeFormsArray.filter(form => form.status === 'published');
	console.log("Draft Forms: ", draftForms);
	//console.log("Data....: ", safeFormsArray[0].Status);

	return (
		<div className="px-22 py-15">
			<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
			{
				isLoading ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-gray-600">Loading...</p>
					</div>
				) : isError ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-red-600">Failed to load forms</p>
					</div>
				) : (
					<div>
						<div className="flex items-center mb-3">
							<h2 className="text-2xl font-semibold text-gray-900">Draft</h2>
							<button
								onClick={handleNewForm}
								className="btn btn-secondary ml-auto"
							>New</button>
						</div>
						<div className="flex flex-wrap gap-6 mb-8">
							{draftForms.length === 0 ? (
								<div className="w-full py-8 text-gray-500">
									No draft forms yet.
								</div>
							) : (
								draftForms.map((form) => {
									return (
										<div key={form.id} className="flex">
											<DraftFormCard
												form={form}
												slug={slug}
												onEdit={handleEditForm}
												onPublish={handlePublishForm}
											/>
										</div>
									);
								})
							)}
						</div>
						<div className="flex items-center mb-3">
							<h2 className="text-2xl font-semibold text-gray-900">Published</h2>
						</div>
						<div className="flex flex-wrap gap-6 mb-8">
							{publishedForms.length === 0 ? (
								<div className="w-full py-8 text-gray-500">
									No published forms yet.
								</div>
							) : (
								publishedForms.map((form) => {
									return (
										<div key={form.id} className="flex">
											<PublishedFormCard
												form={form}
												onViewResult={handleViewResult}
												slug={slug}
											/>
										</div>
									);
								})
							)}
						</div>
					</div>
				)
			}
		</div>
	)
};

export default FormList;