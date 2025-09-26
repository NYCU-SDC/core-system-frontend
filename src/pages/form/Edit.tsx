import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChoiceOption, FormData, QuestionType, QuestionResponse, BaseQuestion } from "@/types/form.ts";
import type {
	DateQuestion,
	LongTextQuestion,
	MultipleChoiceQuestion,
	Question,
	ShortTextQuestion,
	SingleChoiceQuestion
} from "@/types/question.ts";
import { createNewQuestion } from '@/types/question.ts';
import "@/components/form/DraftFormCard.css"
import { GroupSelector } from "@/components/form/GroupSelector.tsx";
import QuestionList from "@/components/form/QuestionList.tsx";
import AddQuestion from "@/components/form/AddQuestion.tsx";
import { useGetForm } from "@/hooks/useGetForm.ts";
import { useGetQuestions } from "@/hooks/useGetQuestions.ts";
import { useGetOrganization } from "@/hooks/useGetOrganization.ts";
import { useGetUnits } from "@/hooks/useGetUnits.ts";
import { publishForm } from "@/lib/request/publishForm.ts";
import { updateForm } from "@/lib/request/updateForm.ts";
import { deleteForm } from "@/lib/request/deleteForm.ts";
import { createForm } from "@/lib/request/createForm.ts";
import { createQuestion } from "@/lib/request/createQuestion.ts";
import { updateQuestion } from "@/lib/request/updateQuestion.ts";
import { deleteQuestion } from "@/lib/request/deleteQuestion.ts";

const FormEdit = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNewForm = id === 'new';

	const { data: form, isLoading: formLoading, isError: formError } = useGetForm(id || '');
	const { data: questionsData, isLoading: questionsLoading, isError: questionsError } = useGetQuestions(id || '');

	const { slug } = useParams<{ slug: string }>();
	const { unitId } = useParams<{ unitId: string }>();
	const { data: organization } = useGetOrganization(slug || '');
	const { data: units } = useGetUnits(slug || '');

	const [formData, setFormData] = useState<FormData | null>(null);
	const [questions, setQuestions] = useState<BaseQuestion[]>([]);
	const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const [selectedPublishUnits, setSelectedPublishUnits] = useState<string[]>([]);
	const availableGroups = units?.map(unit => unit.name);

	const convertUnitNamesToIds = (unitNames: string[]): string[] => {
		return unitNames.map(name => {
			const unit = units.find(u => u.name === name);
			return unit ? unit.id : '';
		}).filter(Boolean);
	};

	// Mutations
	const updateFormMutation = useMutation({
		mutationFn:(data: {id: string; request: {title: string; description: string}}) =>
			updateForm(data.id, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Form', id] });
			queryClient.invalidateQueries({ queryKey: ['Forms'] });
			setAutoSaveStatus('saved');
			setHasUnsavedChanges(false);
		},
		onError: (error) => {
			console.error('Failed to update form:', error);
			setAutoSaveStatus('error');
		}
	})

	const deleteFormMutation = useMutation({
		mutationFn:(id: string) =>
			deleteForm(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Forms'] });
		},
		onError: (error) => {
			console.error('Failed to delete form:', error);
			alert("Failed to delete form. Please try again.");
		}
	})

	const createFormMutation = useMutation({
		mutationFn:(data: {slug: string; unitId: string; request: {title: string; description: string}}) =>
			createForm(data.slug, data.unitId, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Forms'] });
		},
		onError: (error) => {
			console.error('Failed to create form:', error);
		}
	})

	const publishFormMutation = useMutation({
		mutationFn: (data: { id: string; request: { orgId: string; unitIds: string[] } }) =>
			publishForm(data.id, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Forms'] });
			queryClient.invalidateQueries({ queryKey: ['Form', id] });
			alert('Form published successfully!');
			navigate('/forms');
		},
		onError: (error) => {
			console.error('Failed to publish form:', error);
			alert('Failed to publish form. Please try again.');
		}
	});

	const createQuestionMutation = useMutation({
		mutationFn: (data: { formId: string, request: {
				required: boolean,
				type: QuestionType,
				title: string,
				description: string,
				order: number,
				choices?: ChoiceOption[]
			} }) =>
			createQuestion(data.formId, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Questions', id] });
		},
		onError: (error) => {
			console.error('Failed to create question:', error);
		}
	})

	const updateQuestionMutation = useMutation({
		mutationFn: (data: { formId: string, questionId: string, request: {
				required: boolean,
				type: QuestionType,
				title: string,
				description: string,
				order: number,
				choices?: ChoiceOption[]
			} }) =>
			updateQuestion(data.formId, data.questionId, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Questions', id] });
		},
		onError: (error) => {
			console.error('Failed to update question:', error);
		}
	})

	const deleteQuestionMutation = useMutation({
		mutationFn: (data: {formId: string, questionId: string}) =>
			deleteQuestion(data.formId, data.questionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Questions', id] });
		},
		onError: (error) => {
			console.error('Failed to delete question:', error);
		}
	})

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
		} else if (form) {
			setFormData({
				...form,
				createdAt: form.createdAt,
				updatedAt: form.updatedAt,
				lastEditor: form.lastEditor || 'Unknown',
				unitId: Array.isArray(form.unitId) ? form.unitId : [form.unitId].filter(Boolean)
			});
		}
	}, [isNewForm, form]);

	useEffect(() => {
		if (questionsData && questionsData.length > 0) {
			setQuestions(questionsData);
		}
	}, [questionsData]);

	// Auto save
	useEffect(() => {
		if (isNewForm || !formData?.id || !hasUnsavedChanges) {
			return;
		}

		const autoSaveTimeout = setTimeout(async () => {
			setAutoSaveStatus('saving');
			updateFormMutation.mutate({
				id: formData.id,
				request: {
					title: formData.title,
					description: formData.description
				}
			});
		}, 2000);

		return () => {
			clearTimeout(autoSaveTimeout);
		};
	}, [isNewForm, formData?.id, hasUnsavedChanges, formData?.title, formData?.description, formData?.unitId]);

	// useEffect(() => {
	// 	if (isNewForm || !formData?.id || !hasUnsavedChanges) {
	// 		return;
	// 	}
	//
	// 	const autoSaveTimeout = setTimeout(async () => {
	// 		try {
	// 			setAutoSaveStatus('saving');
	// 			await updateForm({
	// 				id: formData.id,
	// 				data: {
	// 					title: formData.title,
	// 					description: formData.description,
	// 					unitIds: formData.unitId
	// 				}
	// 			}).unwrap();
	// 			setAutoSaveStatus('saved');
	// 			setHasUnsavedChanges(false);
	// 		} catch (error) {
	// 			console.error('Auto-save failed:', error);
	// 			setAutoSaveStatus('error');
	// 		}
	// 	}, 2000);
	//
	// 	return () => {
	// 		clearTimeout(autoSaveTimeout);
	// 	};
	// }, [isNewForm, formData?.id, hasUnsavedChanges, formData?.title, formData?.description, formData?.unitId, updateForm]);

	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData(prev => prev ? { ...prev, ...updates } : null);
		setHasUnsavedChanges(true);
	};

	const handlePublishUnitsChange = (selectedGroupNames: string[]) => {
		setSelectedPublishUnits(selectedGroupNames);
	};

	const handleBackToForms = async () => {
		if (hasUnsavedChanges || (isNewForm && (formData?.title || formData?.description || questions.length > 0))) {
			try {
				setAutoSaveStatus('saving');
				if (isNewForm) {
					await handleSaveDraft();
				} else if (formData) {
					await updateFormMutation.mutateAsync({
						id: formData.id,
						request: {
							title: formData.title,
							description: formData.description,
						}
					});
				}
				setAutoSaveStatus('saved');
				setHasUnsavedChanges(false);
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
			navigate(`/${slug}/forms`);
			return;
		}

		if (window.confirm("Are you sure to delete this form?")) {
			try {
				await deleteFormMutation.mutateAsync(formData.id);
				navigate(`/${slug}/forms`);
			} catch (error) {
				//console.error('Failed to delete before navigation:', error);
			}
		}
	};

	const handleSaveDraft = async (): Promise<FormData> => {
		if (!formData) {
			throw new Error('No form data to save');
		}

		try {
			if (isNewForm) {
				const newForm = await createFormMutation.mutateAsync({
					slug: slug,
					unitId: unitId,
					request: {
						title: formData.title,
						description: formData.description,
					}
				});

				const updatedFormData = { ...formData, id: newForm.id };
				setFormData(prev => prev ? { ...prev, id: newForm.id } : null);

				if (questions.length > 0) {
					console.log('開始保存問題:', questions.length, '個');
					const createdQuestions = [];
					for (const question of questions) {
						try {
							const createdQuestion = await createQuestionMutation.mutateAsync({
								formId: newForm.id,
								request: {
									required: question.required,
									type: question.type,
									title: question.title,
									description: question.description,
									order: question.order,
									choices: question.choices,

									// 根據問題類型添加特定屬性
									// ...(question.type === "short_text" && {
									// 	placeholder: question.placeholder,
									// 	maxLength: question.maxLength
									// }),
									// ...(question.type === "long_text" && {
									// 	placeholder: question.placeholder,
									// 	maxLength: question.maxLength,
									// 	rows: question.rows
									// }),
									// ...((question.type === "single_choice" ||
									// 	question.type === "multiple_choice") && {
									// 	options: question.options,
									// 	allowOther: question.allowOther
									// }),
									// ...(question.type === "multiple_choice" && {
									// 	minSelections: question.minSelections,
									// 	maxSelections: question.maxSelections
									// }),
									// ...(question.type === "date" && {
									// 	dateFormat: question.dateFormat,
									// 	minDate: question.minDate,
									// 	maxDate: question.maxDate
									// })
								}
							});
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
				const updatedForm = await updateFormMutation.mutateAsync({
					id: formData.id,
					request: {
						title: formData.title,
						description: formData.description,
					}
				})
				setHasUnsavedChanges(false);
				return updatedForm;
			}
		} catch (error) {
			console.error('Failed to save form:', error);
			throw error;
		}
	};

	const handlePublish = async () => {
		if (!formData) return;

		if (selectedPublishUnits.length === 0) {
			alert('Please select at least one unit to publish to.');
			return;
		}

		try {
			let formToPublish = formData;
			if (isNewForm || !formData.id) {
				formToPublish = await handleSaveDraft();
			}

			if (!formToPublish.id) {
				alert('Please save the form first before publishing.');
				return;
			}

			const unitIds = convertUnitNamesToIds(selectedPublishUnits);

			// const recipients = {
			// 	unitIds: formToPublish.unitId,
			// };

			await publishFormMutation.mutateAsync({
				id: formToPublish.id,
				request: {
					orgId: organization.id,
					unitIds: unitIds
				}
			});
		} catch (error) {
			// in mutation
		}
	};

	const handleAddQuestion = async (type: QuestionType) => {
		const newQuestion = createNewQuestion(type, questions.length);

		if (!formData?.id) {
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
			return;
		}

		try {
			const createdQuestion = await createQuestionMutation.mutateAsync({
				formId: formData.id,
				request: {
					required: newQuestion.required,
					type: newQuestion.type,
					title: newQuestion.title,
					description: newQuestion.description,
					order: newQuestion.order,
					choices: newQuestion.choices,
					// ...(newQuestion.type === "short_text" && {
					// 	placeholder: newQuestion.placeholder,
					// 	maxLength: newQuestion.maxLength
					// }),
					// ...(newQuestion.type === "long_text" && {
					// 	placeholder: newQuestion.placeholder,
					// 	maxLength: newQuestion.maxLength,
					// 	rows: newQuestion.rows
					// }),
					// ...((newQuestion.type === "single_choice" ||
					// 	newQuestion.type === "multiple_choice") && {
					// 	options: newQuestion.options,
					// 	allowOther: newQuestion.allowOther
					// }),
					// ...(newQuestion.type === "multiple_choice" && {
					// 	minSelections: newQuestion.minSelections,
					// 	maxSelections: newQuestion.maxSelections
					// }),
					// ...(newQuestion.type === "date" && {
					// 	dateFormat: newQuestion.dateFormat,
					// 	minDate: newQuestion.minDate,
					// 	maxDate: newQuestion.maxDate
					// })
				}
			})

			setQuestions([...questions, createdQuestion]);
		} catch (error) {
			setQuestions([...questions, newQuestion]);
			setHasUnsavedChanges(true);
		}
	};

	const handleUpdateQuestion = async (questionId: string, updatedQuestion: Question) => {
		setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
		setHasUnsavedChanges(true);

		if (formData?.id && !isNewForm) {
			try {
				const questionToUpdate = {
					...updatedQuestion,
					title: updatedQuestion.title?.trim() || `Untitled ${updatedQuestion.type.replace('_', ' ')} Question`
				};

				await updateQuestionMutation.mutateAsync({
					formId: formData.id,
					questionId,
					request: questionToUpdate
				});
			} catch (error) {
				// in mutation
			}
		}
	};


	const handleDeleteQuestion = async (questionId: string) => {
		setQuestions(questions.filter(q => q.id !== questionId));
		setHasUnsavedChanges(true);

		if (formData?.id && !isNewForm) {
			try {
				await deleteQuestionMutation.mutateAsync({
					formId: formData.id,
					questionId
				});
			} catch (error) {
				// in mutation
			}
		}
	};

	const handleReorderQuestions = async (reorderedQuestions: Question[]) => {
		setQuestions(reorderedQuestions);

		if (!formData?.id) {
			setHasUnsavedChanges(true);
			return;
		}

		try {
			const updatePromises = reorderedQuestions.map((question, index) =>
				updateQuestionMutation.mutateAsync({
					formId: formData.id,
					questionId: question.id,
					request: {
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
						disabled={deleteFormMutation.isPending}
						className="btn btn-primary bg-red-600 text-white"
					>{deleteFormMutation.isPending ? 'Deleting...' : 'Delete'}</button>
					<button
						onClick={handlePublish}
						disabled={createFormMutation.isPending || publishFormMutation.isPending}
						className="btn btn-secondary"
					>{publishFormMutation.isPending ? 'Publishing...' : 'Publish'}</button>
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
								selectedGroups={selectedPublishUnits || []}
								availableGroups={availableGroups || []}
								onGroupsChange={handlePublishUnitsChange}
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