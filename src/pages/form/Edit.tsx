import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChoiceOption, FormData, QuestionType, BaseQuestion } from "@/types/form.ts";
import type { Question } from "@/types/question.ts";
import { createNewQuestion } from "@/types/question.ts";
import AddQuestion from "@/components/form/AddQuestion.tsx";
import { QuestionList } from "@/components/form/QuestionList.tsx";
import { FormInfo } from "@/components/form/FormInfo.tsx";
import { FormSettings } from "@/components/form/FormSettings.tsx";
import { useGetForm } from "@/hooks/useGetForm.ts";
import { useGetQuestions } from "@/hooks/useGetQuestions.ts";
import { useToast } from "@/hooks/useToast.ts";
import { UnauthorizedError } from "@/lib/request/api.ts";
import { publishForm } from "@/lib/request/publishForm.ts";
import { updateForm } from "@/lib/request/updateForm.ts";
import { deleteForm } from "@/lib/request/deleteForm.ts";
import { createForm } from "@/lib/request/createForm.ts";
import { createQuestion } from "@/lib/request/createQuestion.ts";
import { updateQuestion } from "@/lib/request/updateQuestion.ts";
import { deleteQuestion } from "@/lib/request/deleteQuestion.ts";
import { getOrganization } from "@/lib/request/getOrganization.ts";
import { getOrganizationUnits } from "@/lib/request/getOrganizationUnits.ts";

const FormEdit = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNewForm = id === "new";
	const { showSuccess, showError } = useToast();

	const { data: form } = useGetForm(id || "");
	const { data: questionsData, isLoading: questionsLoading } = useGetQuestions(id || "");

	const { slug } = useParams<{ slug: string }>();
	const { data: organization } = useQuery({
		queryKey: ["Organization", slug],
		queryFn: () => getOrganization(slug!),
		enabled: !!slug
	});
	const { data: units } = useQuery({
		queryKey: ["OrganizationUnits", slug],
		queryFn: () => getOrganizationUnits(slug!),
		enabled: !!slug
	});

	const [formData, setFormData] = useState<FormData | null>(null);
	const [questions, setQuestions] = useState<BaseQuestion[]>([]);
	const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error">("saved");
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [questionsInitialized, setQuestionsInitialized] = useState(false);

	// Update queue for questions
	const updateQueueRef = useRef<Set<string>>(new Set()); // Set of question IDs to update
	const createQueueRef = useRef<BaseQuestion[]>([]); // Array of questions to create
	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const questionsRef = useRef<BaseQuestion[]>(questions); // Keep latest questions in ref
	const formDataRef = useRef<FormData | null>(formData); // Keep latest formData in ref

	// Update refs when state changes
	useEffect(() => {
		questionsRef.current = questions;
	}, [questions]);

	useEffect(() => {
		formDataRef.current = formData;
	}, [formData]);

	const [selectedPublishUnits, setSelectedPublishUnits] = useState<string[]>([]);
	const availableGroups = units?.map(unit => unit.name) || [];

	const convertUnitNamesToIds = (unitNames: string[]): string[] => {
		return unitNames
			.map(name => {
				const unit = units?.find(u => u.name === name);
				return unit ? unit.id : "";
			})
			.filter(Boolean);
	};

	// Mutations
	const updateFormMutation = useMutation({
		mutationFn: (data: { id: string; request: { title: string; description: string } }) => updateForm(data.id, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["Form", id] });
			queryClient.invalidateQueries({ queryKey: ["Forms"] });
			setAutoSaveStatus("saved");
			setHasUnsavedChanges(false);
		},
		onError: error => {
			console.error("Failed to update form:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			setAutoSaveStatus("error");
			showError("儲存失敗", "無法更新表單，請稍後再試");
		}
	});

	const deleteFormMutation = useMutation({
		mutationFn: (id: string) => deleteForm(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["Forms"] });
			showSuccess("刪除成功", "表單已成功刪除");
		},
		onError: error => {
			console.error("Failed to delete form:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			showError("刪除失敗", "無法刪除表單，請稍後再試");
		}
	});

	const createFormMutation = useMutation({
		mutationFn: (data: { slug: string; unitId: string; request: { title: string; description: string } }) => createForm(data.slug, data.unitId, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["Forms"] });
			showSuccess("建立成功", "表單已成功建立");
		},
		onError: error => {
			console.error("Failed to create form:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			showError("建立失敗", "無法建立表單，請稍後再試");
		}
	});

	const publishFormMutation = useMutation({
		mutationFn: (data: { id: string; request: { orgId: string; unitIds: string[] } }) => publishForm(data.id, data.request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["Forms"] });
			queryClient.invalidateQueries({ queryKey: ["Form", id] });
			showSuccess("發布成功", "表單已成功發布");
			navigate(`/${slug}/forms`);
		},
		onError: error => {
			console.error("Failed to publish form:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			showError("發布失敗", "無法發布表單，請稍後再試");
		}
	});

	const createQuestionMutation = useMutation({
		mutationFn: (data: {
			formId: string;
			request: {
				required: boolean;
				type: QuestionType;
				title: string;
				description: string;
				order: number;
				choices?: ChoiceOption[];
			};
		}) => createQuestion(data.formId, data.request),
		onSuccess: () => {
			// Invalidate questions query to ensure fresh data on next load
			queryClient.invalidateQueries({ queryKey: ["Questions", id] });
		},
		onError: error => {
			console.error("Failed to create question:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			showError("新增問題失敗", "無法新增問題，請稍後再試");
		}
	});

	const updateQuestionMutation = useMutation({
		mutationFn: (data: {
			formId: string;
			questionId: string;
			request: {
				required: boolean;
				type: QuestionType;
				title: string;
				description: string;
				order: number;
				choices?: ChoiceOption[];
			};
		}) => updateQuestion(data.formId, data.questionId, data.request),
		onSuccess: () => {
			// Invalidate questions query to ensure fresh data on next load
			queryClient.invalidateQueries({ queryKey: ["Questions", id] });
			setAutoSaveStatus("saved");
			setHasUnsavedChanges(false);
		},
		onError: error => {
			console.error("Failed to update question:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			setAutoSaveStatus("error");
			showError("更新問題失敗", "無法儲存問題變更，請稍後再試");
		}
	});

	const deleteQuestionMutation = useMutation({
		mutationFn: (data: { formId: string; questionId: string }) => deleteQuestion(data.formId, data.questionId),
		onSuccess: () => {
			// Invalidate questions query to ensure fresh data on next load
			queryClient.invalidateQueries({ queryKey: ["Questions", id] });
		},
		onError: error => {
			console.error("Failed to delete question:", error);
			// Global error handler will catch 401 errors
			if (error instanceof UnauthorizedError) return;
			showError("刪除問題失敗", "無法刪除問題，請稍後再試");
		}
	});

	useEffect(() => {
		if (isNewForm) {
			setFormData({
				id: "",
				title: "",
				description: "",
				unitId: [],
				status: "draft",
				lastEditor: "",
				createdAt: "",
				updatedAt: ""
			});
		} else if (form) {
			// Handle lastEditor - it might be a User object or a string
			let editorName = "Unknown";
			if (form.lastEditor) {
				if (typeof form.lastEditor === "string") {
					editorName = form.lastEditor;
				} else if (typeof form.lastEditor === "object" && "name" in form.lastEditor) {
					editorName = form.lastEditor.name || form.lastEditor.username || "Unknown";
				}
			}

			setFormData({
				...form,
				createdAt: form.createdAt,
				updatedAt: form.updatedAt,
				lastEditor: editorName,
				unitId: Array.isArray(form.unitId) ? form.unitId : [form.unitId].filter(Boolean)
			});
		}
	}, [isNewForm, form]);

	useEffect(() => {
		// Initialize questions from server data when:
		// 1. Not currently loading
		// 2. We have data (even if empty array)
		// 3. Haven't initialized yet for this form
		if (!questionsLoading && questionsData !== undefined && !questionsInitialized) {
			setQuestions(questionsData);
			setQuestionsInitialized(true);
		}
	}, [questionsData, questionsLoading, questionsInitialized]);

	// Reset questionsInitialized when form id changes
	useEffect(() => {
		setQuestionsInitialized(false);
		// Don't clear questions here to avoid flickering
		// They will be replaced when new data arrives
	}, [id]);

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
			setAutoSaveStatus("saving");
			updateFormMutation.mutate({
				id: formData.id,
				request: {
					title: formData.title,
					description: formData.description
				}
			});
		}, 2000);

		return () => clearTimeout(autoSaveTimeout);
	}, [isNewForm, formData?.id, formData?.title, formData?.description, updateFormMutation]);

	// Process update queue - batch process all queued changes
	const processUpdateQueue = useCallback(async () => {
		const currentFormData = formDataRef.current;
		if (!currentFormData?.id) return;

		const updateIds = Array.from(updateQueueRef.current);
		const createItems = [...createQueueRef.current];

		// Clear queues
		updateQueueRef.current.clear();
		createQueueRef.current = [];

		if (updateIds.length === 0 && createItems.length === 0) {
			setAutoSaveStatus("saved");
			return;
		}

		setAutoSaveStatus("saving");

		try {
			// Process updates (only for existing questions, not temporary ones)
			if (updateIds.length > 0) {
				const updatePromises = updateIds
					.filter(questionId => !questionId.startsWith("question_temp_")) // Skip temporary IDs
					.map(questionId => {
						const question = questionsRef.current.find(q => q.id === questionId);
						if (!question) return Promise.resolve();

						return updateQuestion(currentFormData.id, question.id, {
							required: question.required,
							type: question.type,
							title: question.title,
							description: question.description || "",
							order: question.order,
							choices: question.choices
						});
					});

				await Promise.all(updatePromises);
			}

			// Process creates one by one to get IDs back
			if (createItems.length > 0) {
				const idMapping = new Map<string, string>(); // Map old ID to new ID

				for (const newQuestion of createItems) {
					const createdQuestion = await createQuestion(currentFormData.id, {
						required: newQuestion.required,
						type: newQuestion.type,
						title: newQuestion.title || "untitled",
						description: newQuestion.description || "",
						order: newQuestion.order,
						choices: newQuestion.choices
					});

					// Store the ID mapping
					idMapping.set(newQuestion.id, (createdQuestion as BaseQuestion).id);
				}

				// Update all IDs at once to minimize re-renders
				if (idMapping.size > 0) {
					setQuestions(prev =>
						prev.map(q => {
							const newId = idMapping.get(q.id);
							if (newId) {
								return { ...q, id: newId };
							}
							return q;
						})
					);

					// Update the queue to use new IDs
					const oldIds = Array.from(idMapping.keys());
					oldIds.forEach(oldId => {
						if (updateQueueRef.current.has(oldId)) {
							updateQueueRef.current.delete(oldId);
							const newId = idMapping.get(oldId);
							if (newId) {
								updateQueueRef.current.add(newId);
							}
						}
					});
				}
			}

			setAutoSaveStatus("saved");
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error("Failed to process update queue:", error);
			setAutoSaveStatus("error");
		}
	}, []);

	// Add question or update to queue and trigger delayed processing
	const addToUpdateQueue = useCallback(
		(questionId: string) => {
			const currentFormData = formDataRef.current;
			if (!currentFormData?.id) return;

			// Check if this is a question in the create queue (has temporary ID)
			const isInCreateQueue = createQueueRef.current.some(q => q.id === questionId);

			if (isInCreateQueue) {
				// If it's in create queue, update the item in create queue with latest data
				const latestQuestion = questionsRef.current.find(q => q.id === questionId);
				if (latestQuestion) {
					const index = createQueueRef.current.findIndex(q => q.id === questionId);
					if (index !== -1) {
						createQueueRef.current[index] = latestQuestion;
					}
				}
			} else {
				// Only add to update queue if it's an existing question (not temporary)
				updateQueueRef.current.add(questionId);
			}

			setHasUnsavedChanges(true);

			// Clear existing timeout and set new one
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}

			updateTimeoutRef.current = setTimeout(() => {
				processUpdateQueue();
			}, 2000);
		},
		[processUpdateQueue]
	);

	// Add new question to create queue
	const addToCreateQueue = useCallback(
		(question: BaseQuestion) => {
			const currentFormData = formDataRef.current;
			if (!currentFormData?.id) return;

			createQueueRef.current.push(question);
			setHasUnsavedChanges(true);

			// Clear existing timeout and set new one
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}

			updateTimeoutRef.current = setTimeout(() => {
				processUpdateQueue();
			}, 2000);
		},
		[processUpdateQueue]
	);

	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData(prev => (prev ? { ...prev, ...updates } : null));
		setHasUnsavedChanges(true);
	};

	const handleQuestionChange = useCallback(
		(questionId: string, updates: Partial<Question>) => {
			setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, ...updates } : q)));
			// Add to update queue
			addToUpdateQueue(questionId);
		},
		[addToUpdateQueue]
	);

	const handlePublishUnitsChange = (selectedGroupNames: string[]) => {
		setSelectedPublishUnits(selectedGroupNames);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const handleBackToForms = async () => {
		if (hasUnsavedChanges) {
			try {
				setAutoSaveStatus("saving");
				if (isNewForm) {
					await handleSaveDraft();
				} else if (formData || questions.length > 0) {
					if (formData) {
						await updateFormMutation.mutateAsync({
							id: formData.id,
							request: {
								title: formData.title,
								description: formData.description
							}
						});
					}
					else if (questions.length > 0) {
						for (const question of questions) {
							await updateQuestionMutation.mutateAsync({
								formId: question.formId,
								questionId: question.id,
								request: {
									required: question.required,
									type: question.type,
									title: question.title,
									description: question.description,
									order: question.order,
									choices: question.choices
								}
							});
						}
					}
				} 
				setAutoSaveStatus("saved");
				setHasUnsavedChanges(false);
				navigate(`/${slug}/forms`);
			} catch (error) {
				console.error("Failed to save before navigation:", error);
				const shouldContinue = window.confirm("There are unsaved changes. Do you want to leave without saving?");
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
			} catch {
				//console.error('Failed to delete before navigation:', error);
			}
		}
	};

	const handleSaveDraft = async (): Promise<FormData> => {
		if (!formData) {
			throw new Error("No form data to save");
		}

		try {
			if (isNewForm) {
				const newForm = (await createFormMutation.mutateAsync({
					slug: slug || "",
					unitId: organization?.id || "",
					request: {
						title: formData.title,
						description: formData.description
					}
				})) as FormData;

				setFormData(prev => (prev ? { ...prev, id: newForm.id } : null));

				if (questions.length > 0) {
					const createdQuestions = [];
					for (const question of questions) {
						try {
							const questionRequest = {
								required: question.required,
								type: question.type,
								title: question.title,
								description: question.description,
								order: question.order,
								...(question.type === "single_choice" || question.type === "multiple_choice" ? { choices: (question as Question & { choices?: ChoiceOption[] }).choices } : {})
							};
							const createdQuestion = (await createQuestionMutation.mutateAsync({
								formId: newForm.id,
								request: questionRequest
							})) as BaseQuestion;
							createdQuestions.push(createdQuestion);
						} catch (error) {
							console.error("Failed to create question:", error);
						}
					}
					if (createdQuestions.length > 0) {
						setQuestions(createdQuestions);
					}
				}
				setHasUnsavedChanges(false);
				return newForm;
			} else {
				const updatedForm = (await updateFormMutation.mutateAsync({
					id: formData.id,
					request: {
						title: formData.title,
						description: formData.description
					}
				})) as FormData;
				setHasUnsavedChanges(false);
				return updatedForm;
			}
		} catch (error) {
			console.error("Failed to save form:", error);
			throw error;
		}
	};

	const handlePublish = async () => {
		if (!formData) return;

		if (!formData.title || formData.title.trim() === "") {
			showError("請輸入表單標題", "發布前請先輸入表單標題");
			return;
		}

		if (selectedPublishUnits.length === 0) {
			showError("請選擇發布單位", "請至少選擇一個單位來發布表單");
			return;
		}

		try {
			let formToPublish = formData;
			if (isNewForm || !formData.id) {
				formToPublish = await handleSaveDraft();
			}

			if (!formToPublish.id) {
				showError("請先儲存表單", "發布前請先儲存表單");
				return;
			}

			const unitIds = convertUnitNamesToIds(selectedPublishUnits);

			await publishFormMutation.mutateAsync({
				id: formToPublish.id,
				request: {
					orgId: organization?.id || "",
					unitIds: unitIds
				}
			});
		} catch {
			// in mutation
		}
	};

	const handleAddQuestion = useCallback(
		(type: QuestionType) => {
			// Order should start from 1, not 0
			const newQuestion = createNewQuestion(type, questionsRef.current.length + 1);

			// Add to local state immediately
			setQuestions(prev => [...prev, newQuestion]);

			const currentFormData = formDataRef.current;
			if (!currentFormData?.id) {
				setHasUnsavedChanges(true);
				return;
			}

			// Add to create queue for batch processing
			addToCreateQueue(newQuestion);
		},
		[addToCreateQueue]
	);

	// handleUpdateQuestion removed - not used in this component

	const handleDeleteQuestion = useCallback(
		async (questionId: string) => {
			setQuestions(prev => prev.filter(q => q.id !== questionId));

			const currentFormData = formDataRef.current;
			if (currentFormData?.id) {
				try {
					await deleteQuestionMutation.mutateAsync({
						formId: currentFormData.id,
						questionId
					});
				} catch (error) {
					console.error("Failed to delete question:", error);
				}
			}
		},
		[deleteQuestionMutation]
	);

	const handleReorderQuestions = useCallback(
		(reorderedQuestions: BaseQuestion[]) => {
			setQuestions(reorderedQuestions);
			// Add all reordered questions to update queue
			reorderedQuestions.forEach(q => addToUpdateQueue(q.id));
		},
		[addToUpdateQueue]
	);

	// Move question up handler - use questionsRef to avoid recreating function
	const moveQuestionUp = useCallback(
		(questionId: string) => {
			const sortedQuestions = [...questionsRef.current].sort((a, b) => a.order - b.order);
			const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

			if (currentIndex > 0) {
				const updatedQuestions = [...sortedQuestions];
				const temp = updatedQuestions[currentIndex].order;
				updatedQuestions[currentIndex].order = updatedQuestions[currentIndex - 1].order;
				updatedQuestions[currentIndex - 1].order = temp;

				handleReorderQuestions(updatedQuestions);
			}
		},
		[handleReorderQuestions]
	);

	const moveQuestionDown = useCallback(
		(questionId: string) => {
			const sortedQuestions = [...questionsRef.current].sort((a, b) => a.order - b.order);
			const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

			if (currentIndex < sortedQuestions.length - 1) {
				const updatedQuestions = [...sortedQuestions];
				const temp = updatedQuestions[currentIndex].order;
				updatedQuestions[currentIndex].order = updatedQuestions[currentIndex + 1].order;
				updatedQuestions[currentIndex + 1].order = temp;

				handleReorderQuestions(updatedQuestions);
			}
		},
		[handleReorderQuestions]
	);

	const pageTitle = isNewForm ? `New Form - ${formData?.title || "Untitled"}` : `Edit Form - ${formData?.title || "Loading..."}`;

	return (
		<div className="px-4 sm:px-22 py-6 sm:py-15">
			<button
				type="button"
				onClick={handleBackToForms}
				className="text-sm mb-8 cursor-pointer"
			>
				Back to Forms
			</button>
			<h1 className="text-3xl font-extrabold text-gray-900 mb-1 pb-5">{pageTitle}</h1>
			<div className="flex items-center mb-5 gap-1.5">
				<span className="pl-1 text-4xl ">☁︎</span>
				<span className="text-sm text-gray-600">
					{autoSaveStatus === "saving" && "Saving..."}
					{autoSaveStatus === "saved" && !hasUnsavedChanges && "All changes saved"}
					{autoSaveStatus === "saved" && hasUnsavedChanges && "Has unsaved changes"}
					{autoSaveStatus === "error" && "Failed to save"}
				</span>
			</div>

			<FormInfo
				formData={formData}
				isNewForm={isNewForm}
				formatDate={formatDate}
				onDelete={handleDelete}
				onPublish={handlePublish}
				isDeleting={deleteFormMutation.isPending}
				isPublishing={createFormMutation.isPending || publishFormMutation.isPending}
			/>

			<FormSettings
				formData={formData}
				isNewForm={isNewForm}
				selectedPublishUnits={selectedPublishUnits}
				availableGroups={availableGroups}
				onFormDataChange={handleFormDataChange}
				onPublishUnitsChange={handlePublishUnitsChange}
			/>

			<QuestionList
				questions={questions}
				isUpdating={updateQuestionMutation.isPending}
				isDeleting={deleteQuestionMutation.isPending}
				onQuestionChange={handleQuestionChange}
				onMoveUp={moveQuestionUp}
				onMoveDown={moveQuestionDown}
				onDelete={handleDeleteQuestion}
			/>

			<AddQuestion onAddQuestion={handleAddQuestion} />
		</div>
	);
};

export default FormEdit;
