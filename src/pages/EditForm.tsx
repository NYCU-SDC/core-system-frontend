import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import type { FormData } from '@/types/form';
import type { Question, QuestionType } from '@/types/question';
import { createNewQuestion } from '@/types/question';
import "@/components/Form/FormCard/DraftFormCard.css"
import { GroupSelector } from "@/components/Form/FormCard/GroupSelector.tsx";
import QuestionList from '@/components/Form/Question/QuestionList';
import AddQuestion from '@/components/Form/Question/AddQuestion';

interface EditFormData extends FormData {
	updatedAt?: string;
	lastEditor?: string;
}

const fetchFormById = async (id: string): Promise<EditFormData | null> => {
	await new Promise(resolve => setTimeout(resolve, 300));

	if (id === 'new') {
		return null;
	}

	return {
		id: id,
		title: '請填寫 SDC 志工制服尺寸與飲食需求',
		unit: ['Administration'],
		description: '為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。',
		time: '2025-04-23 16:00',
		updatedAt: '2025-04-24 16:00',
		lastEditor: 'Nikka Lin',
		status: 'draft'
	};
};

const EditForm: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<EditFormData | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);
	const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
	const isNewForm = id === 'new';

	const availableGroups = ["General", "Administration", "Education", "Branding", "Finance", "Engineering"];

	useEffect(() => {
		const loadForm = async () => {
			try {
				setLoading(true);
				const data = await fetchFormById(id!);
				if (isNewForm) {
					setFormData({
						id: '',
						title: '',
						unit: [],
						description: '',
						time: '',
						status: 'draft'
					});
				} else {
					setFormData(data);
				}
			} catch (error) {
				console.error('Failed to load form:', error);
			} finally {
				setLoading(false);
			}
		};

		loadForm();
	}, [id, isNewForm]);

	useEffect(() => {
		if (!isNewForm && formData) {
			const autoSaveInterval = setInterval(() => {
				setAutoSaveStatus('saving');
				setTimeout(() => {
					setAutoSaveStatus('saved');
				}, 1000);
			}, 30000);

			return () => clearInterval(autoSaveInterval);
		}
	}, [isNewForm, formData]);

	const handleBackToForms = () => {
		navigate('/forms');
	};

	const handleDelete = () => {
		if (window.confirm('Are you sure to delete this form?')) {
			console.log('Delete form:', id);
			navigate('/forms');
		}
	};

	const handleSaveDraft = () => {
		console.log('Save as draft:', id);
	};

	const handlePublish = () => {
		console.log('Publish form:', id);
	};

	const handleAddQuestion = (type: QuestionType) => {
		const newQuestion = createNewQuestion(type, questions.length);
		setQuestions([...questions, newQuestion]);
	};

	const handleUpdateQuestion = (questionId: string, updatedQuestion: Question) => {
		setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
	};

	const handleDeleteQuestion = (questionId: string) => {
		setQuestions(questions.filter(q => q.id !== questionId));
	};

	const handleReorderQuestions = (reorderedQuestions: Question[]) => {
		setQuestions(reorderedQuestions);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	};

	if (loading) {
		return (
			<div className="p-10">
				<div className="flex justify-center items-center h-64">
					<p className="text-gray-600">Loading form...</p>
				</div>
			</div>
		);
	}

	const pageTitle = isNewForm
		? 'New Form - Untitled'
		: `Edit Form - ${formData?.title || 'Loading...'}`;

	return (
		<div className="px-22 py-15">
			<button
				onClick={handleBackToForms}
				className="text-sm mb-8 cursor-pointer">
				Back to Forms
			</button>
			<h1 className="text-3xl font-extrabold text-gray-900 mb-1 pb-5">{pageTitle}</h1>
			<div className="flex items-center mb-5 gap-1.5">
				<span className="pl-1">☁︎</span>
				<span className="text-sm text-gray-600">
          			{autoSaveStatus === 'saving' && 'Saving...'}
					{autoSaveStatus === 'saved' && 'Edit saved'}
					{autoSaveStatus === 'error' && 'Failed to save'}
        		</span>
			</div>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="font-semibold text-lg leading-7 mb-3">Info</div>
				<div className="font-normal text-sm leading-6 text-slate-800 mb-4">
					<div>Status: Draft</div>
					<div className="flex gap-1">
						<label>Created At: </label>
						<p>{isNewForm ? 'Not created yet' : formatDate(formData?.time || '')}</p>
					</div>
					<div className="flex gap-1">
						<label>Updated At: </label>
						<p>{isNewForm ? 'Not created yet' : formatDate(formData?.updatedAt || '')}</p>
					</div>
					<div className="flex gap-1">
						<label>Last Editor: </label>
						<p>{isNewForm ? 'You' : (formData?.lastEditor || 'unknown')}</p>
					</div>
				</div>
				<div className="flex gap-3">
					{isNewForm ? (
						<>
							<button
								onClick={handleSaveDraft}
								className="btn btn-primary"
							>Draft</button>
							<button
								onClick={handlePublish}
								className="btn btn-secondary"
							>Publish</button>
						</>
					) : (
						<>
							<button
								onClick={handleDelete}
								className="btn btn-primary bg-red-600 text-white"
							>Delete</button>
							<button
								onClick={handlePublish}
								className="btn btn-secondary"
							>Publish</button>
						</>

					)}
				</div>
			</div>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="font-medium text-base leading-4 mb-5 text-slate-800">Form Settings</div>
				<div className="w-[508px]">
					<div className="flex items-center gap-6 mb-3">
						<label className="text-sm w-[89px] text-slate-800">Title</label>
						<textarea
							value={formData?.title || ''}
							onChange={(e) => {
								if (formData) {
									setFormData({ ...formData, title: e.target.value });
								}
							}}
							placeholder={isNewForm ? "Enter form title" : formData?.title || "Enter form title"}
							rows={1}
							className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
						/>
					</div>
					<div className="flex items-center gap-6 mb-3">
						<label className="text-sm w-[89px] text-slate-800">Description</label>
						<textarea
							value={formData?.description || ''}
							onChange={(e) => {
								if (formData) {
									setFormData({ ...formData, description: e.target.value });
								}
							}}
							placeholder={isNewForm ? "Enter form description" : formData?.description || "Enter form description"}
							rows={5}
							className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
						/>
					</div>
					<div className="flex items-center gap-6">
						<label className="text-sm w-[89px] text-slate-800">Unit</label>
						<div className="flex-1">
							<GroupSelector
								selectedGroups={formData?.unit || []}
								availableGroups={availableGroups}
								onGroupsChange={(groups) => {
									if (formData) {
										setFormData({ ...formData, unit: groups });
									}
								}}
								label=""
								placeholder="Select which unit to send to"
							/>
						</div>
					</div>
				</div>
			</div>
			<QuestionList
				questions={questions}
				onUpdateQuestion={handleUpdateQuestion}
				onDeleteQuestion={handleDeleteQuestion}
				onReorderQuestions={handleReorderQuestions}
			/>
			<AddQuestion onAddQuestion={handleAddQuestion} />
		</div>
	)
}

export default EditForm;