import React, { useState, useEffect, useRef } from 'react'
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
import { createNewQuestion, QuestionTypeLabels } from '@/types/question.ts';
import "@/components/form/DraftFormCard.css"
import { GroupSelector } from "@/components/form/GroupSelector.tsx";
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
	const [questionsInitialized, setQuestionsInitialized] = useState(false);

	// Update queue for questions
	const updateQueueRef = useRef<Set<string>>(new Set()); // Set of question IDs to update
	const createQueueRef = useRef<BaseQuestion[]>([]); // Array of questions to create
	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const questionsRef = useRef<BaseQuestion[]>(questions); // Keep latest questions in ref

	// Update questionsRef when questions change
	useEffect(() => {
		questionsRef.current = questions;
	}, [questions]);

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
			navigate(`/${slug}/forms`);
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
			// Don't invalidate queries - we manage questions in local state
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
			// Don't invalidate queries here - we'll do it selectively
			// to avoid losing focus during typing
			setAutoSaveStatus('saved');
			setHasUnsavedChanges(false);
		},
		onError: (error) => {
			console.error('Failed to update question:', error);
			setAutoSaveStatus('error');
		}
	})

	const deleteQuestionMutation = useMutation({
		mutationFn: (data: {formId: string, questionId: string}) =>
			deleteQuestion(data.formId, data.questionId),
		onSuccess: () => {
			// Don't invalidate queries - we manage questions in local state
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
		// Only initialize questions once from server data
		// After that, use local state to avoid losing focus during edits
		if (questionsData && questionsData.length > 0 && !questionsInitialized) {
			setQuestions(questionsData);
			setQuestionsInitialized(true);
		}
	}, [questionsData, questionsInitialized]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}
		};
	}, []);

	// Auto save for form data
	useEffect(() => {
		if (isNewForm || !formData?.id) {
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

		return () => clearTimeout(autoSaveTimeout);
	}, [isNewForm, formData?.id, formData?.title, formData?.description]);

	// Process update queue - batch process all queued changes
	const processUpdateQueue = async () => {
		if (!formData?.id) return;

		const updateIds = Array.from(updateQueueRef.current);
		const createItems = [...createQueueRef.current];

		// Clear queues
		updateQueueRef.current.clear();
		createQueueRef.current = [];

		if (updateIds.length === 0 && createItems.length === 0) {
			setAutoSaveStatus('saved');
			return;
		}

		setAutoSaveStatus('saving');

		try {
			// Process updates
			if (updateIds.length > 0) {
				const updatePromises = updateIds.map(questionId => {
					const question = questionsRef.current.find(q => q.id === questionId);
					if (!question) return Promise.resolve();

					return updateQuestion(formData.id, question.id, {
						required: question.required,
						type: question.type,
						title: question.title,
						description: question.description || '',
						order: question.order,
						choices: question.choices
					});
				});

				await Promise.all(updatePromises);
			}

			// Process creates one by one to get IDs back
			if (createItems.length > 0) {
				for (const newQuestion of createItems) {
					const createdQuestion = await createQuestion(formData.id, {
						required: newQuestion.required,
						type: newQuestion.type,
						title: newQuestion.title || "untitled",
						description: newQuestion.description || "",
						order: newQuestion.order,
						choices: newQuestion.choices
					});

					// Update local state with the real ID from server
					setQuestions(prev => 
						prev.map(q => 
							q.id === newQuestion.id ? { ...createdQuestion as BaseQuestion } : q
						)
					);
				}
			}

			setAutoSaveStatus('saved');
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error('Failed to process update queue:', error);
			setAutoSaveStatus('error');
		}
	};

	// Add question or update to queue and trigger delayed processing
	const addToUpdateQueue = (questionId: string) => {
		if (!formData?.id) return;

		updateQueueRef.current.add(questionId);
		setHasUnsavedChanges(true);

		// Clear existing timeout and set new one
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}

		updateTimeoutRef.current = setTimeout(() => {
			processUpdateQueue();
		}, 2000);
	};

	// Add new question to create queue
	const addToCreateQueue = (question: BaseQuestion) => {
		if (!formData?.id) return;

		createQueueRef.current.push(question);
		setHasUnsavedChanges(true);

		// Clear existing timeout and set new one
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}

		updateTimeoutRef.current = setTimeout(() => {
			processUpdateQueue();
		}, 2000);
	};

	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData(prev => prev ? { ...prev, ...updates } : null);
		setHasUnsavedChanges(true);
	};

	const handleQuestionChange = (questionId: string, updates: Partial<Question>) => {
		setQuestions(questions.map(q =>
			q.id === questionId ? { ...q, ...updates } : q
		));
		// Add to update queue
		addToUpdateQueue(questionId);
	};

	const handlePublishUnitsChange = (selectedGroupNames: string[]) => {
		setSelectedPublishUnits(selectedGroupNames);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleBackToForms = async () => {
		if (hasUnsavedChanges) {
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
				navigate(`/${slug}/forms`);
			} catch (error) {
				console.error('Failed to save before navigation:', error);
				const shouldContinue = window.confirm('There are unsaved changes. Do you want to leave without saving?');
				if (shouldContinue) {
					navigate(`/${slug}/forms`);
				}
			}
		} else {
			navigate(`/${slug}/forms`);
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
					unitId: organization.id,
					request: {
						title: formData.title,
						description: formData.description,
					}
				});

				setFormData(prev => prev ? { ...prev, id: newForm.id } : null);

				if (questions.length > 0) {
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
									choices: (question as any).choices,
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

	const handleAddQuestion = (type: QuestionType) => {
		const newQuestion = createNewQuestion(type, questions.length);

		// Add to local state immediately
		setQuestions([...questions, newQuestion]);

		if (!formData?.id) {
			setHasUnsavedChanges(true);
			return;
		}

		// Add to create queue for batch processing
		addToCreateQueue(newQuestion);
	};

	const handleUpdateQuestion = (questionId: string, updatedQuestion: Question) => {
		setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
		// Add to update queue
		addToUpdateQueue(questionId);
	};

	const handleDeleteQuestion = async (questionId: string) => {
		setQuestions(questions.filter(q => q.id !== questionId));

		if (formData?.id) {
			try {
				await deleteQuestionMutation.mutateAsync({
					formId: formData.id,
					questionId
				});
			} catch (error) {
				console.error('Failed to delete question:', error);
			}
		}
	};

	const handleReorderQuestions = (reorderedQuestions: Question[]) => {
		setQuestions(reorderedQuestions);
		// Add all reordered questions to update queue
		reorderedQuestions.forEach(q => addToUpdateQueue(q.id));
	};

	// Question List Component (merged from QuestionList.tsx)
	const QuestionListContent = () => {
		const moveQuestionUp = async (questionId: string) => {
			const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
			const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

			if (currentIndex > 0) {
				const updatedQuestions = [...sortedQuestions];
				const temp = updatedQuestions[currentIndex].order;
				updatedQuestions[currentIndex].order = updatedQuestions[currentIndex - 1].order;
				updatedQuestions[currentIndex - 1].order = temp;

				handleReorderQuestions(updatedQuestions);
			}
		};

		const moveQuestionDown = async (questionId: string) => {
			const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
			const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

			if (currentIndex < sortedQuestions.length - 1) {
				const updatedQuestions = [...sortedQuestions];
				const temp = updatedQuestions[currentIndex].order;
				updatedQuestions[currentIndex].order = updatedQuestions[currentIndex + 1].order;
				updatedQuestions[currentIndex + 1].order = temp;

				handleReorderQuestions(updatedQuestions);
			}
		};

		const addOption = (questionId: string, optionLabel: string) => {
			const question = questions.find(q => q.id === questionId);
			if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
				return;
			}

			const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
			const newOption: ChoiceOption = {
				id: `opt_${Date.now()}`,
				name: optionLabel,
				value: optionLabel.toLowerCase().replace(/\s+/g, '_')
			};

			const updatedQuestion = {
				...choiceQuestion,
				choices: [...choiceQuestion.choices, newOption]
			};

			handleUpdateQuestion(questionId, updatedQuestion);
		};

		const removeOption = (questionId: string, optionId: string) => {
			const question = questions.find(q => q.id === questionId);
			if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
				return;
			}

			const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
			const updatedQuestion = {
				...choiceQuestion,
				options: choiceQuestion.options.filter(option => option.id !== optionId)
			};

			handleUpdateQuestion(questionId, updatedQuestion);
		};

		const updateOption = (questionId: string, optionId: string, newLabel: string) => {
			const question = questions.find(q => q.id === questionId);
			if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
				return;
			}

			const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
			const updatedQuestion = {
				...choiceQuestion,
				options: choiceQuestion.options.map(option =>
					option.id === optionId
						? { ...option, name: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, '_') }
						: option
				)
			};

			handleUpdateQuestion(questionId, updatedQuestion);
		};

		const OptionEditor: React.FC<{ question: SingleChoiceQuestion | MultipleChoiceQuestion }> = ({ question }) => {
			const [newOptionText, setNewOptionText] = useState('');

			const handleAddOption = () => {
				if (newOptionText.trim()) {
					addOption(question.id, newOptionText.trim());
					setNewOptionText('');
				}
			};

			const handleKeyPress = (e: React.KeyboardEvent) => {
				if (e.key === 'Enter') {
					handleAddOption();
				}
			};

			return (
				<div className="flex gap-6 mb-3 w-[600px]">
					<label className="text-sm w-[89px] text-slate-800 pt-0.5">Options</label>
					<div className="flex flex-col gap-3">
						{question.choices.map((option) => (
							<div key={option.id} className="flex items-center gap-2 md-3 w-[387.5px]">
								<textarea
									value={option.name}
									onChange={(e) => updateOption(question.id, option.id, e.target.value)}
									rows={1}
									className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
								/>
								<button
									type="button"
									onClick={() => removeOption(question.id, option.id)}
									className="p-1 text-gray-400 hover:text-black transition-colors -ml-10"
									title="Delete option"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						))}
						<div className="flex gap-3">
							<textarea
								value={newOptionText}
								onChange={(e) => setNewOptionText(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Add an option..."
								rows={1}
								className="w-[396px] text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
							/>
							<button
								type="button"
								onClick={handleAddOption}
							>
								Add
							</button>
						</div>
					</div>
				</div>
			);
		};

		if (questions.length === 0) {
			return null;
		}

		return (
			<div className="space-y-5">
				{questions
					.sort((a, b) => a.order - b.order)
					.map((question, index) => {
						const isFirst = index === 0;
						const isLast = index === questions.length - 1;
						const isUpdating = updateQuestionMutation.isPending;
						const isDeleting = deleteQuestionMutation.isPending;

						return (
							<div
								key={question.id}
								className="bg-white border border-slate-300 rounded-md p-6 w-[800px]"
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className="font-medium text-base mb-5 text-slate-800">
												{QuestionTypeLabels[question.type]}
											</span>
										</div>
										<div className="w-[508px]">
											<div className="flex items-center gap-6 mb-3">
												<label className="text-sm w-[89px] text-slate-800">Title</label>
												<textarea
													value={question?.title || ''}
													onChange={(e) => {
														handleQuestionChange(question.id, { title: e.target.value });
													}}
													placeholder="Enter question title"
													rows={1}
													className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
												/>
											</div>
											<div className="flex items-center gap-6 mb-3">
												<label className="text-sm w-[89px] text-slate-800">Description</label>
												<textarea
													value={question.description || ''}
													onChange={(e) => {
														handleQuestionChange(question.id, { description: e.target.value });
													}}
													placeholder="Enter question description (optional)"
													rows={2}
													className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
													
												/>
											</div>
											{(question.type === 'single_choice' || question.type === 'multiple_choice') && (
												<OptionEditor question={question as SingleChoiceQuestion | MultipleChoiceQuestion} />
											)}
										</div>
									</div>
									<div className="flex gap-2 ml-4">
										<button
											type="button"
											onClick={() => moveQuestionUp(question.id)}
											disabled={isFirst || isUpdating}
											className={`p-1 transition-colors ${
												isFirst || isUpdating
													? 'text-gray-300 cursor-not-allowed'
													: 'text-gray-400 hover:text-slate-800 cursor-pointer'
											}`}
											title="Move up"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
													  d="M5 15l7-7 7 7" />
											</svg>
										</button>
										<button
											type="button"
											onClick={() => moveQuestionDown(question.id)}
											disabled={isLast || isUpdating}
											className={`p-1 transition-colors ${
												isLast || isUpdating
													? 'text-gray-300 cursor-not-allowed'
													: 'text-gray-400 hover:text-slate-800 cursor-pointer'
											}`}
											title="Move down"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
													  d="M19 9l-7 7-7-7" />
											</svg>
										</button>
										<button
											type="button"
											onClick={() => handleDeleteQuestion(question.id)}
											className="p-1 text-gray-400 hover:text-red-600 transition-colors"
											disabled={isDeleting}
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
													  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</div>
							</div>
						);
					})}
			</div>
		);
	};

	const pageTitle = isNewForm
		? `New Form - ${formData?.title || 'Untitled'}`
		: `Edit Form - ${formData?.title || 'Loading...'}`;

	return (
		<div className="px-22 py-15">
			<button
				type="button"
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
						type="button"
						onClick={handleDelete}
						disabled={deleteFormMutation.isPending}
						className="btn btn-primary bg-red-600 text-white"
					>{deleteFormMutation.isPending ? 'Deleting...' : 'Delete'}</button>
					<button
						type="button"
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
			<QuestionListContent />
			<AddQuestion onAddQuestion={handleAddQuestion} />
		</div>
	)
}

export default FormEdit;