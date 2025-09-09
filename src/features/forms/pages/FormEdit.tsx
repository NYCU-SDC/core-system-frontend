import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import type { FormData, QuestionType } from "@/types/form.ts";
import type {
	DateQuestion,
	LongTextQuestion, MultipleChoiceQuestion,
	Question,
	ShortTextQuestion,
	SingleChoiceQuestion
} from "@/features/forms/types/question.ts";
import { createNewQuestion } from '@/features/forms/types/question.ts';
import "@/features/forms/components/DraftFormCard.css"
import { GroupSelector } from "@/features/forms/components/GroupSelector.tsx";
import QuestionList from "@/features/forms/components/QuestionList.tsx";
import AddQuestion from "@/features/forms/components/AddQuestion.tsx";
import {
	useGetFormQuery,
	useGetQuestionsQuery,
	useUpdateFormMutation,
	useDeleteFormMutation,
	useCreateFormMutation,
	usePublishFormMutation,
	useCreateQuestionMutation,
	useUpdateQuestionMutation,
	useDeleteQuestionMutation
} from '@/features/forms/api/formApi.ts';

const FormEdit: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isNewForm = id === 'new';

	const {
		data: apiFormData,
		isLoading: formLoading,
		error: formError
	} = useGetFormQuery(id!, { skip: isNewForm });

	const {
		data: apiQuestions = [],
		isLoading: questionsLoading,
		error: questionsError
	} = useGetQuestionsQuery(id!, { skip: isNewForm });

	const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
	const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();
	const [createForm, { isLoading: isCreating }] = useCreateFormMutation();
	const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();

	const [createQuestion] = useCreateQuestionMutation();
	const [updateQuestion] = useUpdateQuestionMutation();
	const [deleteQuestion] = useDeleteQuestionMutation();

	const [formData, setFormData] = useState<FormData | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const availableGroups = ["General", "Administration", "Education", "Branding", "Finance", "Engineering"];

	useEffect(() => {
		if (isNewForm) {
			setFormData({
				id: '',
				title: '',
				description: '',
				unitId: [],
				status: 'draft',
				lastEditor: '',
				createdAt: '',
				updatedAt: ''
			});
		} else if (apiFormData) {
			setFormData({
				...apiFormData,
				createdAt: apiFormData.createdAt,
				updatedAt: apiFormData.updatedAt,
				lastEditor: apiFormData.lastEditor || 'Unknown',
				unitId: Array.isArray(apiFormData.unitId) ? apiFormData.unitId : [apiFormData.unitId].filter(Boolean)
			});
		}
	}, [isNewForm, apiFormData]);

	useEffect(() => {
		if (apiQuestions && apiQuestions.length > 0) {
			setQuestions(apiQuestions);
		}
	}, [apiQuestions]);

	useEffect(() => {
		if (!isNewForm && formData && hasUnsavedChanges) {
			const autoSaveInterval = setInterval(async () => {
				if (hasUnsavedChanges && formData.id) {
					try {
						setAutoSaveStatus('saving');
						await updateForm({
							id: formData.id,
							data: {
								title: formData.title,
								description: formData.description,
								unitIds: formData.unitId
							}
						}).unwrap();
						setAutoSaveStatus('saved');
						setHasUnsavedChanges(false);
					} catch (error) {
						console.error('Auto-save failed:', error);
						setAutoSaveStatus('error');
					}
				}
			}, 30000); // Auto-save every 30 seconds

			return () => clearInterval(autoSaveInterval);
		}
	}, [isNewForm, formData, hasUnsavedChanges, updateForm]);

	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData(prev => prev ? { ...prev, ...updates } : null);
		setHasUnsavedChanges(true);
	};

	const handleBackToForms = () => {
		if (hasUnsavedChanges) {
			handleSaveDraft();
		} else {
			navigate('/forms');
		}
	};

	const handleDelete = async () => {
		if (window.confirm("Are you sure to delete this form?")) {
			try {
				await deleteForm(id!).unwrap();
				navigate("/forms");
			} catch (error) {
				console.error("Failed to delete form:", error);
				alert("Failed to delete form. Please try again.");
			}
		}
	};

	const handleSaveDraft = async () => {
		if (!formData) return;

		try {
			if (isNewForm) {
				// For new forms, we need orgSlug and unitId
				// You might need to get these from context or props
				const orgSlug = 'default-org'; // Replace with actual org slug
				const unitId = 'default-unit-id'; // Replace with actual unit ID

				const newForm = await createForm({
					orgSlug,
					unitId,
					data: {
						title: formData.title,
						description: formData.description,
						unitIds: formData.unitId
					}
				}).unwrap();

				// Navigate to edit the newly created form
				navigate(`/forms/edit/${newForm.id}`);
			} else {
				await updateForm({
					id: formData.id,
					data: {
						title: formData.title,
						description: formData.description,
						unitIds: formData.unitId
					}
				}).unwrap();
			}
			setHasUnsavedChanges(false);
			alert('Form saved successfully!');
		} catch (error) {
			console.error('Failed to save form:', error);
			alert('Failed to save form. Please try again.');
		}
	};

	const handlePublish = async () => {
		if (!formData?.id) {
			alert('Please save the form first before publishing.');
			return;
		}

		try {
			// Basic recipient selection - you might want to show a modal for this
			const recipients = {
				unitIds: formData.unitId,
			};

			await publishForm({
				id: formData.id,
				recipients
			}).unwrap();

			alert('Form published successfully!');
			navigate('/forms');
		} catch (error) {
			console.error('Failed to publish form:', error);
			alert('Failed to publish form. Please try again.');
		}
	};

	const handleAddQuestion = async (type: QuestionType) => {
		if (!formData?.id) {
			// 如果是新表單，只在本地狀態中添加
			const newQuestion = createNewQuestion(type, questions.length);
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
			return;
		}

		try {
			const newQuestion = createNewQuestion(type, questions.length);

			// 調用 API 創建問題
			const createdQuestion = await createQuestion({
				formId: formData.id,
				data: {
					type: newQuestion.type,
					title: newQuestion.title,
					description: newQuestion.description,
					required: newQuestion.required,
					order: newQuestion.order,
					// 根據問題類型添加特定屬性
					...(newQuestion.type === "short_text" && {
						placeholder: newQuestion.placeholder,
						maxLength: newQuestion.maxLength
					}),
					...(newQuestion.type === "long_text" && {
						placeholder: newQuestion.placeholder,
						maxLength: newQuestion.maxLength,
						rows: newQuestion.rows
					}),
					...((newQuestion.type === "single_choice" ||
						newQuestion.type === "multiple_choice") && {
						options: newQuestion.options,
						allowOther: newQuestion.allowOther
					}),
					...(newQuestion.type === "multiple_choice" && {
						minSelections: newQuestion.minSelections,
						maxSelections: newQuestion.maxSelections
					}),
					...(newQuestion.type === "date" && {
						dateFormat: newQuestion.dateFormat,
						minDate: newQuestion.minDate,
						maxDate: newQuestion.maxDate
					})
				}
			}).unwrap();

			setQuestions([...questions, createdQuestion]);
		} catch (error) {
			console.error("Failed to create question:", error);
			// 如果 API 調用失敗，回退到本地狀態
			const newQuestion = createNewQuestion(type, questions.length);
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
		}
	};

	const handleUpdateQuestion = async (questionId: string, updatedQuestion: Question) => {
		if (!formData?.id) {
			// 如果是新表單，只更新本地狀態
			setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
			setHasUnsavedChanges(true);
			return;
		}

		try {
			// 調用 API 更新問題
			await updateQuestion ({
				formId: formData.id,
				questionId,
				data: {
					type: updatedQuestion.type,
					title: updatedQuestion.title,
					description: updatedQuestion.description,
					required: updatedQuestion.required,
					order: updatedQuestion.order,
					// 根據問題類型添加特定屬性
					...(updatedQuestion.type === 'short_text' && {
						placeholder: (updatedQuestion as ShortTextQuestion).placeholder,
						maxLength: (updatedQuestion as ShortTextQuestion).maxLength
					}),
					...(updatedQuestion.type === 'long_text' && {
						placeholder: (updatedQuestion as LongTextQuestion).placeholder,
						maxLength: (updatedQuestion as LongTextQuestion).maxLength,
						rows: (updatedQuestion as LongTextQuestion).rows
					}),
					...(updatedQuestion.type === 'single_choice' || updatedQuestion.type === 'multiple_choice') && {
						options: (updatedQuestion as SingleChoiceQuestion).options,
						allowOther: (updatedQuestion as SingleChoiceQuestion).allowOther
					},
					...(updatedQuestion.type === 'multiple_choice' && {
						minSelections: (updatedQuestion as MultipleChoiceQuestion).minSelections,
						maxSelections: (updatedQuestion as MultipleChoiceQuestion).maxSelections
					}),
					...(updatedQuestion.type === 'date' && {
						dateFormat: (updatedQuestion as DateQuestion).dateFormat,
						minDate: (updatedQuestion as DateQuestion).minDate,
						maxDate: (updatedQuestion as DateQuestion).maxDate
					})
				}
			}).unwrap();

			setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
		} catch (error) {
			console.error('Failed to update question:', error);
			// 如果 API 調用失敗，仍然更新本地狀態
			setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
			setHasUnsavedChanges(true);
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		if (!formData?.id) {
			// 如果是新表單，只從本地狀態中刪除
			setQuestions(questions.filter(q => q.id !== questionId));
			setHasUnsavedChanges(true);
			return;
		}

		try {
			// 調用 API 刪除問題
			await deleteQuestion({
				formId: formData.id,
				questionId
			}).unwrap();

			setQuestions(questions.filter(q => q.id !== questionId));
		} catch (error) {
			console.error('Failed to delete question:', error);
			// 如果 API 調用失敗，仍然從本地狀態中刪除
			setQuestions(questions.filter(q => q.id !== questionId));
			setHasUnsavedChanges(true);
		}
	};

	const handleReorderQuestions = async (reorderedQuestions: Question[]) => {
		setQuestions(reorderedQuestions);

		if (!formData?.id) {
			setHasUnsavedChanges(true);
			return;
		}

		// 如果是已保存的表單，更新每個問題的順序
		try {
			const updatePromises = reorderedQuestions.map((question, index) =>
				updateQuestion({
					formId: formData.id,
					questionId: question.id,
					data: {
						...question,
						order: index
					}
				})
			);

			await Promise.all(updatePromises);
		} catch (error) {
			console.error('Failed to reorder questions:', error);
			setHasUnsavedChanges(true);
		}
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

	const isLoading = formLoading || questionsLoading;
	const hasError = formError || questionsError;

	if (isLoading) {
		return (
			<div className="p-10">
				<div className="flex justify-center items-center h-64">
					<p className="text-gray-600">Loading form...</p>
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="p-10">
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<p className="text-red-600 mb-4">Failed to load form</p>
						<button
							onClick={() => navigate('/forms')}
							className="btn btn-primary"
						>
							Back to Forms
						</button>
					</div>
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
					{autoSaveStatus === 'saved' && !hasUnsavedChanges && 'All changes saved'}
					{autoSaveStatus === 'saved' && hasUnsavedChanges && 'Has unsaved changes'}
					{autoSaveStatus === 'error' && 'Failed to save'}
        		</span>
			</div>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="font-semibold text-lg leading-7 mb-3">Info</div>
				<div className="font-normal text-sm leading-6 text-slate-800 mb-4">
					<div>Status: {formData?.status === 'draft' ? 'Draft' : 'Published'}</div>
					<div className="flex gap-1">
						<label>Created At: </label>
						<p>{isNewForm ? 'Not created yet' : formatDate(formData?.createdAt || '')}</p>
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
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="btn btn-primary bg-red-600 text-white"
					>{isCreating ? 'Deleting...' : 'Delete'}</button>
					<button
						onClick={handlePublish}
						disabled={isCreating || isPublishing}
						className="btn btn-secondary"
					>{isPublishing ? 'Publishing...' : 'Publish'}</button>
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
								selectedGroups={formData?.unitId || []}
								availableGroups={availableGroups}
								onGroupsChange={(groups) => handleFormDataChange({ unitId: groups })}
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

export default FormEdit;