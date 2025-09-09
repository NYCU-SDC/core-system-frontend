import DraftFormCard from "@/features/forms/components/DraftFormCard.tsx";
import PublishedFormCard from "@/features/forms/components/PublishedFormCard.tsx";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFormsQuery } from '@/features/forms/api/formApi.ts';

const FormList: React.FC = () => {
	const navigate = useNavigate();
	const { data: forms, isLoading, error } = useGetFormsQuery();

	/*console.log('FormList - isLoading:', isLoading);
	console.log('FormList - error:', error);
	console.log('FormList - forms:', forms);*/

	const handleNewForm = () => {
		console.log('Create new form');
		navigate('/forms/edit/new');
	};

	const handleEditForm = (id: string) => {
		console.log('Edit form:', id);
		navigate(`/forms/edit/${id}`);
	};

	const handleViewResult = (id: string) => {
		console.log('View result:', id);
		navigate(`/forms/results/${id}`);
	};

	const handlePublishForm = (id: string) => {
		console.log('Publish form:', id);
	};

	const safeFormsArray = forms || [];
	const draftForms = safeFormsArray.filter(form => form.status === 'draft');
	const publishedForms = safeFormsArray.filter(form => form.status === 'published');

	if (isLoading) {
		return (
			<div className="px-22 py-15">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
				<div className="flex justify-center items-center h-64">
					<p className="text-gray-600">Loading forms...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="px-22 py-15">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<p className="text-red-600 mb-4">Failed to load forms</p>
						<button
							onClick={() => window.location.reload()}
							className="btn btn-primary"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="px-22 py-15">
			<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
			<div className="flex">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Draft</h2>
				<button
					onClick={handleNewForm}
					className="btn btn-secondary ml-auto"
				>New</button>
			</div>

			<div className="flex flex-wrap gap-6 mb-8">
				<div className="w-135">
					{draftForms.length === 0 ? (
						<div className="w-full py-8 text-gray-500">
							No draft forms yet.
						</div>
					) : (
						draftForms.map((form) => (
							<div key={form.id} className="w-135">
								<DraftFormCard
									form={form}
									onEdit={handleEditForm}
									onPublish={handlePublishForm}
								/>
							</div>
						))
					)}
				</div>
			</div>
			<h2 className="text-xl font-semibold text-gray-900 mb-4">Published</h2>
			<div className="flex flex-wrap gap-6 mb-8">
				<div className="w-135">
					{publishedForms.length === 0 ? (
						<div className="w-full py-8 text-gray-500">
							No published forms yet.
						</div>
					) : (
						publishedForms.map((form) => (
							<div key={form.id} className="w-135">
								<PublishedFormCard
									form={form}
									onViewResult={handleViewResult}
								/>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default FormList;