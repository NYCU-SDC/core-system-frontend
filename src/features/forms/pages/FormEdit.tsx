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

	console.log('=== FormEdit Debug Info ===');
	console.log('URL id:', id);
	console.log('isNewForm:', isNewForm);

	const formQuery = useGetFormQuery(id!, { skip: isNewForm });
	const questionsQuery = useGetQuestionsQuery(id!, { skip: isNewForm });

	console.log('=== Form Query Debug ===');
	console.log('formQuery:', formQuery);
	console.log('formQuery.isLoading:', formQuery.isLoading);
	console.log('formQuery.isError:', formQuery.isError);
	console.log('formQuery.error:', formQuery.error);
	console.log('formQuery.data:', formQuery.data);
	console.log('formQuery.isSuccess:', formQuery.isSuccess);
	console.log('formQuery.isFetching:', formQuery.isFetching);

	console.log('=== Questions Query Debug ===');
	console.log('questionsQuery:', questionsQuery);
	console.log('questionsQuery.isLoading:', questionsQuery.isLoading);
	console.log('questionsQuery.isError:', questionsQuery.isError);
	console.log('questionsQuery.error:', questionsQuery.error);
	console.log('questionsQuery.data:', questionsQuery.data);
	console.log('questionsQuery.isSuccess:', questionsQuery.isSuccess);
	console.log('questionsQuery.isFetching:', questionsQuery.isFetching);

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
		console.log('=== Query Status Changed ===');
		console.log('formLoading:', formLoading);
		console.log('questionsLoading:', questionsLoading);
		console.log('formError:', formError);
		console.log('questionsError:', questionsError);
		console.log('apiFormData:', apiFormData);
		console.log('apiQuestions:', apiQuestions);
	}, [formLoading, questionsLoading, formError, questionsError, apiFormData, apiQuestions]);

	useEffect(() => {
		if (isNewForm) {
			console.log('設置新表單的預設資料');
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
			console.log('設置從 API 獲取的表單資料:', apiFormData);
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
			console.log('設置從 API 獲取的問題資料:', apiQuestions);
			setQuestions(apiQuestions);
		}
	}, [apiQuestions]);

	useEffect(() => {
		if (!isNewForm && (formLoading || questionsLoading)) {
			console.log('開始載入計時器...');
			const timeout = setTimeout(() => {
				console.error('載入超時！可能的原因：');
				console.error('1. API 端點無回應');
				console.error('2. 網路連線問題');
				console.error('3. 伺服器錯誤');
				console.error('目前查詢狀態：');
				console.error('- formLoading:', formLoading);
				console.error('- questionsLoading:', questionsLoading);
				console.error('- formError:', formError);
				console.error('- questionsError:', questionsError);
			}, 10000); // 10秒超時

			return () => clearTimeout(timeout);
		}
	}, [isNewForm, formLoading, questionsLoading, formError, questionsError]);

	useEffect(() => {
		if (isNewForm || !formData?.id || !hasUnsavedChanges) {
			return;
		}

		// 使用 setTimeout 而不是 setInterval，實現 debounce 效果
		const autoSaveTimeout = setTimeout(async () => {
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
		}, 2000); // 2 秒後自動保存

		return () => {
			clearTimeout(autoSaveTimeout);
		};
	}, [isNewForm, formData?.id, hasUnsavedChanges, formData?.title, formData?.description, formData?.unitId, updateForm]);

	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData(prev => prev ? { ...prev, ...updates } : null);
		setHasUnsavedChanges(true);
	};

	const handleBackToForms = async () => {
		if (hasUnsavedChanges || (isNewForm && (formData?.title || formData?.description || questions.length > 0))) {
			try {
				setAutoSaveStatus('saving');
				if (isNewForm) {
					console.log('新表單需要保存，開始保存...');
					await handleSaveDraft();
				} else if (formData) {
					console.log('現有表單有更改，開始保存...');
					await updateForm({
						id: formData.id,
						data: {
							title: formData.title,
							description: formData.description,
							unitIds: formData.unitId
						}
					}).unwrap();
				}
				setAutoSaveStatus('saved');
				setHasUnsavedChanges(false);
				console.log('表單已保存，準備導航回列表頁面');
				navigate('/forms');
			} catch (error) {
				console.error('Failed to save before navigation:', error);
				const shouldContinue = window.confirm('There are unsaved changes. Do you want to leave without saving?');
				if (shouldContinue) {
					navigate('/forms');
				}
			}
		} else {
			navigate('/forms');
		}
	};

	const handleDelete = async () => {
		if (!formData?.id) {
			navigate('/forms');
			return;
		}

		if (window.confirm("Are you sure to delete this form?")) {
			try {
				await deleteForm(formData.id).unwrap();
				navigate("/forms");
			} catch (error) {
				console.error("Failed to delete form:", error);
				alert("Failed to delete form. Please try again.");
			}
		}
	};

	const handleSaveDraft = async (): Promise<FormData> => {
		if (!formData) {
			throw new Error('No form data to save');
		}

		console.log('=== handleSaveDraft 開始 ===');
		console.log('isNewForm:', isNewForm);
		console.log('formData:', formData);
		console.log('questions to save:', questions);

		try {
			const orgSlug = 'nycu-sdc';
			const defaultUnitId = '09bab8cf-eeac-4ff5-a4e3-4fd7662f749b';
			if (isNewForm) {
				const requestData = {
					orgSlug,
					unitId: defaultUnitId,
					data: {
						title: formData.title || 'Untitled Form',
						description: formData.description || '',
						unitIds: formData.unitId
					}
				};

				console.log('準備創建新表單，參數:', requestData);
				const newForm = await createForm(requestData).unwrap();
				console.log('新表單創建成功:', newForm);

				// 更新本地狀態
				const updatedFormData = { ...formData, id: newForm.id };
				setFormData(prev => prev ? { ...prev, id: newForm.id } : null);
				//setHasUnsavedChanges(false);

				if (questions.length > 0) {
					console.log('開始保存問題:', questions.length, '個');
					const createdQuestions = [];
					for (const question of questions) {
						try {
							console.log('正在創建問題:', question.title);
							const createdQuestion = await createQuestion({
								formId: newForm.id,
								data: {
									type: question.type,
									title: question.title,
									description: question.description,
									required: question.required,
									order: question.order,
									// 根據問題類型添加特定屬性
									...(question.type === "short_text" && {
										placeholder: question.placeholder,
										maxLength: question.maxLength
									}),
									...(question.type === "long_text" && {
										placeholder: question.placeholder,
										maxLength: question.maxLength,
										rows: question.rows
									}),
									...((question.type === "single_choice" ||
										question.type === "multiple_choice") && {
										options: question.options,
										allowOther: question.allowOther
									}),
									...(question.type === "multiple_choice" && {
										minSelections: question.minSelections,
										maxSelections: question.maxSelections
									}),
									...(question.type === "date" && {
										dateFormat: question.dateFormat,
										minDate: question.minDate,
										maxDate: question.maxDate
									})
								}
							}).unwrap();
							console.log('問題創建成功:', createdQuestion);
							createdQuestions.push(createdQuestion);
						} catch (error) {
							console.error('Failed to create question:', error);
						}
					}
					if (createdQuestions.length > 0) {
						setQuestions(createdQuestions);
					}
				}
				setHasUnsavedChanges(false);
				return newForm;
			} else {
				const updatedForm = await updateForm({
					id: formData.id,
					data: {
						title: formData.title,
						description: formData.description,
						unitIds: formData.unitId
					}
				}).unwrap();

				setHasUnsavedChanges(false);
				return updatedForm;
			}
		} catch (error) {
			console.error('Failed to save form:', error);
			console.error('錯誤詳情:', JSON.stringify(error, null, 2));
			throw error;
		}
	};

	const handlePublish = async () => {
		if (!formData) return;

		try {
			// 如果是新表單，先儲存
			let formToPublish = formData;
			if (isNewForm || !formData.id) {
				formToPublish = await handleSaveDraft();
			}

			if (!formToPublish.id) {
				alert('Please save the form first before publishing.');
				return;
			}

			const recipients = {
				unitIds: formToPublish.unitId,
			};

			await publishForm({
				id: formToPublish.id,
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
		const newQuestion = createNewQuestion(type, questions.length);

		if (!formData?.id) {
			// 如果是新表單，只在本地狀態中添加
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
			return;
		}

		try {
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
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
		}
	};

	const handleUpdateQuestion = async (questionId: string, updatedQuestion: Question) => {
		// 先更新本地狀態
		setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
		setHasUnsavedChanges(true);

		// 如果是已儲存的表單，才調用 API
		if (formData?.id && !isNewForm) {
			try {
				// 確保更新的問題有標題
				const questionToUpdate = {
					...updatedQuestion,
					title: updatedQuestion.title?.trim() || `Untitled ${updatedQuestion.type.replace('_', ' ')} Question`
				};

				console.log('更新問題數據:', questionToUpdate);

				await updateQuestion({
					formId: formData.id,
					questionId,
					data: questionToUpdate
				}).unwrap();

				console.log('問題更新成功');
			} catch (error) {
				console.error('Failed to update question:', error);
			}
		}
	};


	const handleDeleteQuestion = async (questionId: string) => {
		// 先更新本地狀態
		setQuestions(questions.filter(q => q.id !== questionId));
		setHasUnsavedChanges(true);

		// 如果是已儲存的表單，才調用 API
		if (formData?.id && !isNewForm) {
			try {
				await deleteQuestion({
					formId: formData.id,
					questionId
				}).unwrap();
			} catch (error) {
				console.error('Failed to delete question:', error);
				// API 失敗時不回滾本地狀態
			}
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
		? `New Form - ${formData?.title || 'Untitled'}`
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
								handleFormDataChange({ title: e.target.value });
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
								handleFormDataChange({ description: e.target.value });
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
				formId={formData?.id}
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