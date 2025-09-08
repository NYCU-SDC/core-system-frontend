import DraftFormCard from "@/features/forms/components/DraftFormCard.tsx";
import PublishedFormCard from "@/features/forms/components/PublishedFormCard.tsx";
import type { FormData } from '@/types/form.ts';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockDraftForm: FormData = {
	id: '1',
	title: '請填寫 SDC 志工制服尺寸與飲食需求',
	unit: ['Administration'],
	description: '為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。',
	time: '2025-04-05',
	status: 'draft'
};

const mockPublishedForm: FormData = {
	id: '2',
	title: '請填寫 SDC 志工制服尺寸與飲食需求',
	unit: ['Administration'],
	description: '為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。',
	time: '2025-04-05',
	status: 'published'
};

const FormList: React.FC = () => {
	const navigate = useNavigate();

	const handleNewForm = () => {
		console.log('Create new form');
		navigate('/forms/edit/new');
	};

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
					<DraftFormCard
						form={mockDraftForm}
						onEdit={(id) => console.log('Edit:', id)}
						onPublish={(id) => console.log('Published:', id)}
					/>
				</div>
				<div className="w-135">
					<DraftFormCard
						form={mockDraftForm}
						onEdit={(id) => console.log('Edit:', id)}
						onPublish={(id) => console.log('Published:', id)}
					/>
				</div>
			</div>
			<h2 className="text-xl font-semibold text-gray-900 mb-4">Published</h2>
			<div className="flex flex-wrap gap-6 mb-8">
				<div className="w-135">
					<PublishedFormCard
						form={mockPublishedForm}
						onViewResult={(id) => console.log('View Result:', id)}
					/>
				</div>
				<div className="w-135">
					<PublishedFormCard
						form={mockPublishedForm}
						onViewResult={(id) => console.log('View Result:', id)}
					/>
				</div>
				<div className="w-135">
					<PublishedFormCard
						form={mockPublishedForm}
						onViewResult={(id) => console.log('View Result:', id)}
					/>
				</div>
			</div>
		</div>
	);
};

export default FormList;