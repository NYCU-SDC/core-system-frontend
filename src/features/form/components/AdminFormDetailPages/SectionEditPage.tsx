import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useCreateQuestion, useDeleteQuestion, useSections, useUpdateQuestion, useUpdateSection } from "@/features/form/hooks/useSections";
import { useUndoableEditor } from "@/features/form/hooks/useUndoableEditor";
import { useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, Input, LoadingSpinner, TextArea, useToast } from "@/shared/components";
import type { FormsQuestionRequest, FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { QuestionCard } from "./components/QuestionCard";
import { QUESTION_STRATEGIES } from "./QuestionConfig";
import styles from "./SectionEditPage.module.css";
import type { Option, Question } from "./types/question";
import { QUESTION_FEATURES } from "./types/question";

type ApiQuestionWithOptionalFields = FormsQuestionResponse & {
	url?: string;
	oauthConnect?: Question["oauthProvider"];
};

type EditorDraft = {
	questions: Question[];
	questionIds: (string | undefined)[];
	sectionTitleDraft: string;
	sectionDescriptionDraft: string;
};

const EMPTY_DRAFT: EditorDraft = {
	questions: [],
	questionIds: [],
	sectionTitleDraft: "",
	sectionDescriptionDraft: ""
};

const ensureQuestionClientId = (question: Question): Question => ({
	...question,
	clientId: question.clientId ?? uuidv4()
});

const ensureOptionId = (option: Option): Option => ({
	...option,
	id: option.id ?? uuidv4()
});

const mapApiChoicesToOptions = (choices: FormsQuestionResponse["choices"], existingOptions?: Option[]): Option[] | undefined =>
	choices?.map((choice, index) =>
		ensureOptionId({
			id: choice.id ?? existingOptions?.[index]?.id,
			label: choice.name ?? "",
			isOther: choice.isOther ?? false
		})
	);

const mapApiChoicesToDetailOptions = (choices: FormsQuestionResponse["choices"], existingDetailOptions?: Question["detailOptions"]): Question["detailOptions"] | undefined =>
	choices?.map((choice, index) => ({
		id: choice.id ?? existingDetailOptions?.[index]?.id ?? uuidv4(),
		label: choice.name ?? "",
		description: choice.description ?? ""
	}));

export const AdminSectionEditPage = () => {
	const { formid, sectionId } = useParams<{ formid: string; sectionId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const orgSlug = useActiveOrgSlug();

	const sectionsQuery = useSections(formid);
	const section = sectionsQuery.data?.flatMap(response => (Array.isArray(response.sections) ? response.sections : [])).find(foundSection => foundSection.id === sectionId);

	const createQuestion = useCreateQuestion(formid!, sectionId!);
	const updateQuestion = useUpdateQuestion(formid!, sectionId!);
	const deleteQuestion = useDeleteQuestion(formid!, sectionId!);
	const updateSectionMutation = useUpdateSection(formid!, sectionId!);
	const workflowQuery = useWorkflow(formid);
	const updateWorkflowMutation = useUpdateWorkflow(formid!);

	const copyQuestionField = <K extends keyof Question>(target: Question, source: Question, key: K) => {
		const value = source[key];
		if (value !== undefined) {
			target[key] = value;
		}
	};

	// States
	const { state: draft, setState: setEditorState, replaceState, undo, redo, flushCheckpoint, canUndo, canRedo } = useUndoableEditor<EditorDraft>(EMPTY_DRAFT, { limit: 100 });
	const { questions, questionIds, sectionTitleDraft, sectionDescriptionDraft } = draft;
	const [savedSectionTitle, setSavedSectionTitle] = useState("");
	const [savedSectionDescription, setSavedSectionDescription] = useState("");
	const questionsRef = useRef<Question[]>([]);
	const questionIdsRef = useRef<(string | undefined)[]>([]);
	const dirtyQuestionIndexesRef = useRef<Set<number>>(new Set());
	const autosaveTimerRef = useRef<number | null>(null);
	const isFlushingDirtyQuestionsRef = useRef(false);
	const [dirtyQuestionVersion, setDirtyQuestionVersion] = useState(0);
	const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);

	// Callbacks
	const setQuestions = useCallback(
		(updater: Question[] | ((prev: Question[]) => Question[]), checkpoint: "immediate" | "debounced" | "none" = "immediate") => {
			setEditorState(
				prev => ({
					...prev,
					questions: typeof updater === "function" ? (updater as (prev: Question[]) => Question[])(prev.questions) : updater
				}),
				{ checkpoint }
			);
		},
		[setEditorState]
	);

	const setQuestionIdsAndRef = useCallback(
		(nextQuestionIds: (string | undefined)[], checkpoint: "immediate" | "debounced" | "none" = "immediate") => {
			questionIdsRef.current = nextQuestionIds;
			setEditorState(
				prev => ({
					...prev,
					questionIds: nextQuestionIds
				}),
				{ checkpoint }
			);
		},
		[setEditorState]
	);

	const updateQuestionAt = useCallback(
		(index: number, updater: (question: Question) => Question, checkpoint: "immediate" | "debounced" | "none" = "immediate") => {
			setQuestions(
				prev =>
					prev.map((question, currentIndex) => {
						if (currentIndex !== index) return question;
						return ensureQuestionClientId(updater(ensureQuestionClientId(question)));
					}),
				checkpoint
			);
		},
		[setQuestions]
	);

	const markQuestionsDirty = useCallback((indexes: number[]) => {
		let hasValidIndex = false;
		indexes.forEach(index => {
			if (index < 0) return;
			hasValidIndex = true;
			if (!dirtyQuestionIndexesRef.current.has(index)) {
				dirtyQuestionIndexesRef.current.add(index);
			}
		});
		if (hasValidIndex) {
			setDirtyQuestionVersion(version => version + 1);
		}
	}, []);

	const markQuestionDirty = useCallback(
		(index: number) => {
			markQuestionsDirty([index]);
		},
		[markQuestionsDirty]
	);

	const markQuestionsDirtyFrom = useCallback(
		(startIndex: number, length: number) => {
			markQuestionsDirty(Array.from({ length: Math.max(0, length - startIndex) }, (_, offset) => startIndex + offset));
		},
		[markQuestionsDirty]
	);

	const saveSectionIfChanged = useCallback(
		(nextSectionTitle: string, nextSectionDescription: string) => {
			if (!sectionId) return;
			if (nextSectionTitle === savedSectionTitle && nextSectionDescription === savedSectionDescription) return;

			updateSectionMutation.mutate(
				{ title: nextSectionTitle, description: nextSectionDescription ? (marked.parse(nextSectionDescription) as string) : nextSectionDescription },
				{
					onSuccess: () => {
						setSavedSectionTitle(nextSectionTitle);
						setSavedSectionDescription(nextSectionDescription);
						if (workflowQuery.data?.workflow) {
							const updatedNodes = workflowQuery.data.workflow.map(n => (n.id === sectionId ? { ...n, label: nextSectionTitle } : n));
							updateWorkflowMutation.mutate(
								updatedNodes.map(n => ({
									id: n.id,
									label: n.label,
									...(n.conditionRule !== undefined && { conditionRule: n.conditionRule }),
									...(n.next !== undefined && { next: n.next }),
									...(n.nextTrue !== undefined && { nextTrue: n.nextTrue }),
									...(n.nextFalse !== undefined && { nextFalse: n.nextFalse })
								}))
							);
						}
					},
					onError: err => {
						pushToast({ title: "儲存失敗", description: (err as Error).message, variant: "error" });
						console.log("儲存失敗");
					}
				}
			);
		},
		[sectionId, savedSectionTitle, savedSectionDescription, updateSectionMutation, workflowQuery.data, updateWorkflowMutation, pushToast]
	);

	const handleSectionBlurSave = useCallback(() => {
		if (!sectionId) return;
		flushCheckpoint();
		saveSectionIfChanged(sectionTitleDraft, sectionDescriptionDraft);
	}, [flushCheckpoint, saveSectionIfChanged, sectionDescriptionDraft, sectionId, sectionTitleDraft]);

	const toApiRequest = (q: Question, order: number): FormsQuestionRequest => {
		const base: FormsQuestionRequest = {
			type: q.type as FormsQuestionRequest["type"],
			title: q.title,
			description: q.description ? (marked.parse(q.description) as string) : q.description,
			required: q.required ?? false,
			order
		};

		if (q.isFromAnswer && q.sourceQuestionId) {
			base.sourceId = q.sourceQuestionId;
			delete base.choices;
		} else if (QUESTION_STRATEGIES[q.type].features.includes("HAS_OPTIONS") && q.options) {
			base.choices = q.options.map(o => ({ name: o.label, isOther: o.isOther ?? false }));
		}

		QUESTION_STRATEGIES[q.type].toApiPayload?.(q, base);
		return base;
	};

	const flushDirtyQuestions = useCallback(async () => {
		if (!formid || !sectionId) return;
		if (isFlushingDirtyQuestionsRef.current) return;
		if (dirtyQuestionIndexesRef.current.size === 0) return;

		flushCheckpoint();
		isFlushingDirtyQuestionsRef.current = true;
		try {
			while (dirtyQuestionIndexesRef.current.size > 0) {
				const dirtyIndexes = [...dirtyQuestionIndexesRef.current].sort((a, b) => a - b);
				dirtyQuestionIndexesRef.current.clear();

				for (const index of dirtyIndexes) {
					const question = questionsRef.current[index];
					if (!question) continue;

					const req = toApiRequest(question, index + 1);
					const existingId = questionIdsRef.current[index];
					const syncQuestionFromApi = (apiQuestion: FormsQuestionResponse) => {
						setQuestions(prev => {
							if (!prev[index]) return prev;
							const old = prev[index];

							const nextOptions = old.isFromAnswer ? [] : old.options;
							const nextDetailOptions = old.detailOptions;

							const updated: Question = {
								...old,
								title: apiQuestion.title ?? old.title,
								description: apiQuestion.description ?? old.description,
								required: apiQuestion.required ?? old.required,
								...(apiQuestion.sourceId !== undefined && {
									sourceQuestionId: apiQuestion.sourceId ?? undefined,
									isFromAnswer: Boolean(apiQuestion.sourceId)
								}),
								icon: (apiQuestion.scale?.icon ?? old.icon) as Question["icon"],
								start: apiQuestion.scale?.minVal ?? old.start,
								end: apiQuestion.scale?.maxVal ?? old.end,
								startLabel: apiQuestion.scale?.minValueLabel ?? old.startLabel,
								endLabel: apiQuestion.scale?.maxValueLabel ?? old.endLabel,
								uploadAllowedFileTypes: apiQuestion.uploadFile?.allowedFileTypes ? [...apiQuestion.uploadFile.allowedFileTypes] : old.uploadAllowedFileTypes,
								uploadMaxFileAmount: apiQuestion.uploadFile?.maxFileAmount ?? old.uploadMaxFileAmount,
								uploadMaxFileSizeLimit: apiQuestion.uploadFile?.maxFileSizeLimit ?? old.uploadMaxFileSizeLimit,
								dateHasYear: apiQuestion.date?.hasYear ?? old.dateHasYear,
								dateHasMonth: apiQuestion.date?.hasMonth ?? old.dateHasMonth,
								dateHasDay: apiQuestion.date?.hasDay ?? old.dateHasDay,
								dateHasMinDate: Boolean(apiQuestion.date?.minDate),
								dateHasMaxDate: Boolean(apiQuestion.date?.maxDate),
								dateMinDate: apiQuestion.date?.minDate ? apiQuestion.date.minDate.slice(0, 10) : "",
								dateMaxDate: apiQuestion.date?.maxDate ? apiQuestion.date.maxDate.slice(0, 10) : "",
								options: nextOptions,
								detailOptions: nextDetailOptions
							};

							const next = [...prev];
							next[index] = updated;
							return next;
						}, "none");
					};
					if (existingId) {
						const updated = await updateQuestion.mutateAsync({ questionId: existingId, req });
						syncQuestionFromApi(updated);
					} else {
						const res = await createQuestion.mutateAsync(req);
						syncQuestionFromApi(res);
						const nextQuestionIds = [...questionIdsRef.current];
						nextQuestionIds[index] = res.id;
						setQuestionIdsAndRef(nextQuestionIds, "none");
					}
				}
			}
		} catch {
			console.log("儲存失敗");
			// pushToast({ title: "儲存失敗", description: (err as Error).message, variant: "error" });
		} finally {
			isFlushingDirtyQuestionsRef.current = false;
		}
	}, [createQuestion, flushCheckpoint, formid, sectionId, setQuestionIdsAndRef, setQuestions, updateQuestion]);

	// Effects
	// Sync from API on first load
	useEffect(() => {
		if (!section?.id) return;
		const apiQuestions = section.questions ?? [];

		const mapped: Question[] = apiQuestions.map(q => {
			const apiQuestion = q as ApiQuestionWithOptionalFields;
			const existingQuestionIndex = questionIdsRef.current.findIndex(questionId => questionId === q.id);
			const existingQuestion = existingQuestionIndex >= 0 ? questionsRef.current[existingQuestionIndex] : undefined;

			return {
				clientId: q.id ?? uuidv4(),
				type: q.type as Question["type"],
				title: q.title,
				description: q.description ?? "",
				required: q.required ?? false,
				isFromAnswer: Boolean(q.sourceId),
				sourceQuestionId: q.sourceId,
				options: mapApiChoicesToOptions(q.choices, existingQuestion?.options),
				detailOptions: mapApiChoicesToDetailOptions(q.choices, existingQuestion?.detailOptions),
				start: q.scale?.minVal,
				end: q.scale?.maxVal,
				startLabel: q.scale?.minValueLabel ?? "",
				endLabel: q.scale?.maxValueLabel ?? "",
				icon: q.scale?.icon as Question["icon"],
				uploadAllowedFileTypes: q.uploadFile?.allowedFileTypes ? [...q.uploadFile.allowedFileTypes] : ["PDF"],
				uploadMaxFileAmount: q.uploadFile?.maxFileAmount ?? 1,
				uploadMaxFileSizeLimit: q.uploadFile?.maxFileSizeLimit ?? 10485760,
				dateHasYear: q.date?.hasYear ?? true,
				dateHasMonth: q.date?.hasMonth ?? true,
				dateHasDay: q.date?.hasDay ?? true,
				dateHasMinDate: Boolean(q.date?.minDate),
				dateHasMaxDate: Boolean(q.date?.maxDate),
				dateMinDate: q.date?.minDate ? q.date.minDate.slice(0, 10) : "",
				dateMaxDate: q.date?.maxDate ? q.date.maxDate.slice(0, 10) : "",
				url: apiQuestion.url ?? "",
				oauthProvider: apiQuestion.oauthConnect
			};
		});

		replaceState({
			questions: mapped,
			questionIds: apiQuestions.map(q => q.id),
			sectionTitleDraft: section.title ?? "",
			sectionDescriptionDraft: section.description ?? ""
		});
		questionIdsRef.current = apiQuestions.map(q => q.id);
		setSavedSectionTitle(section.title ?? "");
		setSavedSectionDescription(section.description ?? "");
		setDirtyQuestionVersion(0);
		dirtyQuestionIndexesRef.current.clear();
	}, [replaceState, section]);

	useEffect(() => {
		questionsRef.current = questions;
	}, [questions]);

	useEffect(() => {
		questionIdsRef.current = questionIds;
	}, [questionIds]);

	useEffect(() => {
		if (dirtyQuestionVersion === 0) return;
		if (autosaveTimerRef.current !== null) {
			window.clearTimeout(autosaveTimerRef.current);
		}
		autosaveTimerRef.current = window.setTimeout(() => {
			void flushDirtyQuestions();
		}, 500);

		return () => {
			if (autosaveTimerRef.current !== null) {
				window.clearTimeout(autosaveTimerRef.current);
			}
		};
	}, [dirtyQuestionVersion, flushDirtyQuestions]);

	useEffect(
		() => () => {
			if (autosaveTimerRef.current !== null) {
				window.clearTimeout(autosaveTimerRef.current);
			}
			void flushDirtyQuestions();
		},
		[flushDirtyQuestions]
	);

	useEffect(() => {
		const isNativeTextUndoTarget = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false;
			if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true;
			if (target instanceof HTMLTextAreaElement) return true;
			if (target instanceof HTMLInputElement) {
				const nonTextTypes = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]);
				return !nonTextTypes.has(target.type);
			}
			return false;
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.isComposing) return;
			const modifierPressed = event.metaKey || event.ctrlKey;
			if (!modifierPressed) return;
			if (isNativeTextUndoTarget(event.target)) return;

			const lowerKey = event.key.toLowerCase();
			const isUndo = lowerKey === "z" && !event.shiftKey;
			const isRedo = (lowerKey === "z" && event.shiftKey) || (lowerKey === "y" && event.ctrlKey && !event.metaKey);
			if (!isUndo && !isRedo) return;

			event.preventDefault();
			if (isUndo) {
				if (!canUndo) return;
				undo();
				return;
			}
			if (!canRedo) return;
			redo();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [canRedo, canUndo, flushCheckpoint, redo, undo]);

	const sourceQuestionOptions = useMemo(
		() =>
			(sectionsQuery.data ?? [])
				.flatMap(sectionRes => sectionRes.sections ?? [])
				.flatMap(sectionItem =>
					(sectionItem.questions ?? [])
						.filter(question => question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE" || question.type === "DETAILED_MULTIPLE_CHOICE" || question.type === "DROPDOWN")
						.map(question => ({
							value: question.id,
							label: `${sectionItem.title} / ${question.title}`
						}))
				),
		[sectionsQuery.data]
	);

	const handleQuestionTypeChange = (index: number, nextType: Question["type"]) => {
		const updatedQuestions = [...questions];
		const prev = updatedQuestions[index];
		if (!prev || prev.type === nextType) return;

		const strategy = QUESTION_STRATEGIES[nextType];
		const next = strategy.initialState();

		const nextQuestion: Question = {
			clientId: prev.clientId ?? uuidv4(),
			type: nextType,
			title: prev.title,
			description: prev.description,
			required: prev.required,
			isFromAnswer: prev.isFromAnswer,
			sourceQuestionId: prev.sourceQuestionId,
			...next
		};

		strategy.features.forEach(field => {
			const keepFields = QUESTION_FEATURES[field];
			keepFields.forEach(keepField => {
				copyQuestionField(nextQuestion, prev, keepField);
			});
		});

		if (nextQuestion.type === "DETAILED_MULTIPLE_CHOICE" && prev.options) {
			nextQuestion.detailOptions = prev.options.map(o => ({ id: o.id ?? uuidv4(), label: o.label, description: "" }));
			delete nextQuestion.options;
		}

		updatedQuestions[index] = nextQuestion;

		setQuestions(updatedQuestions, "immediate");
		markQuestionDirty(index);
	};

	const handleDeleteQuestionWithApi = async (index: number) => {
		const existingId = questionIds[index];
		if (existingId) {
			try {
				await deleteQuestion.mutateAsync(existingId);
			} catch {
				console.log("儲存失敗");
				//pushToast({ title: "刪除失敗", description: (err as Error).message, variant: "error" });
				return;
			}
		}
		handleRemoveQuestion(index);
	};

	const handleBack = () => {
		navigate(`/orgs/${orgSlug}/forms/${formid}/edit`);
	};

	const handleAddQuestion = (type: Question["type"]) => {
		const newIndex = questions.length;
		const strategy = QUESTION_STRATEGIES[type];

		const newQuestion: Question = {
			clientId: uuidv4(),
			type,
			title: "問題標題",
			description: "",
			required: false,
			isFromAnswer: false,
			...strategy.initialState()
		};

		const updatedQuestions = [...questions, newQuestion];
		setQuestions(updatedQuestions, "immediate");
		setNewlyAddedIndex(newIndex);
		markQuestionDirty(newIndex);
	};

	const handleRemoveQuestion = (index: number) => {
		const updatedQuestions = questions.filter((_, currentIndex) => currentIndex !== index);
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index, 1);
		questionIdsRef.current = updatedQuestionIds;
		setEditorState(
			prev => ({
				...prev,
				questions: updatedQuestions,
				questionIds: updatedQuestionIds
			}),
			{ checkpoint: "immediate" }
		);
		markQuestionsDirtyFrom(index, updatedQuestions.length);
	};

	const handleDuplicateQuestion = (index: number) => {
		const updatedQuestions = questions.flatMap((question, currentIndex) => {
			if (currentIndex !== index) return [question];
			return [question, { ...structuredClone(question), clientId: uuidv4() }];
		});
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index + 1, 0, undefined);
		questionIdsRef.current = updatedQuestionIds;
		setEditorState(
			prev => ({
				...prev,
				questions: updatedQuestions,
				questionIds: updatedQuestionIds
			}),
			{ checkpoint: "immediate" }
		);
		markQuestionsDirtyFrom(index + 1, updatedQuestions.length);
	};

	const handleTitleChange = (index: number, newTitle: string) => {
		if (questions[index]?.title === newTitle) return;
		updateQuestionAt(index, question => ({ ...question, title: newTitle }), "debounced");
		markQuestionDirty(index);
	};

	const handleDescriptionChange = (index: number, newDescription: string) => {
		if (questions[index]?.description === newDescription) return;
		updateQuestionAt(index, question => ({ ...question, description: newDescription }), "debounced");
		markQuestionDirty(index);
	};

	const handleAddOption = (questionIndex: number, newOption: Option) => {
		const optionWithId = ensureOptionId({ id: newOption.id ?? uuidv4(), ...newOption });

		updateQuestionAt(
			questionIndex,
			question => {
				const currentOptions = question.options ?? [];
				const otherOptionIndex = currentOptions.findIndex(option => option.isOther);
				let nextOptions = currentOptions;
				if (optionWithId.isOther) {
					if (otherOptionIndex !== -1) return question;
					nextOptions = [...currentOptions, optionWithId];
				} else if (otherOptionIndex !== -1) {
					nextOptions = [...currentOptions.slice(0, otherOptionIndex), optionWithId, ...currentOptions.slice(otherOptionIndex)];
				} else {
					nextOptions = [...currentOptions, optionWithId];
				}
				return { ...question, options: nextOptions };
			},
			"immediate"
		);
		markQuestionDirty(questionIndex);
	};

	const handleAddDetailOption = (questionIndex: number, newDetailOption: { label: string; description: string }) => {
		const detailOption = { id: uuidv4(), ...newDetailOption };
		updateQuestionAt(questionIndex, question => ({ ...question, detailOptions: [...(question.detailOptions ?? []), detailOption] }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, options: question.options?.filter((_, currentIndex) => currentIndex !== optionIndex) ?? [] }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleChangeOption = (questionIndex: number, optionIndex: number, newLabel: string) => {
		const currentLabel = questions[questionIndex]?.options?.[optionIndex]?.label;
		if (currentLabel === newLabel) return;

		updateQuestionAt(
			questionIndex,
			question => ({
				...question,
				options: (question.options ?? []).map((option, currentIndex) => (currentIndex === optionIndex ? { ...option, label: newLabel } : option))
			}),
			"debounced"
		);
		markQuestionDirty(questionIndex);
	};

	const handleStartChange = (questionIndex: number, newStart: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, start: newStart }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleEndChange = (questionIndex: number, newEnd: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, end: newEnd }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleChangeIcon = (questionIndex: number, newIcon: Question["icon"]) => {
		updateQuestionAt(questionIndex, question => ({ ...question, icon: newIcon }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleToggleIsFromAnswer = (questionIndex: number) => {
		updateQuestionAt(
			questionIndex,
			question => {
				const isFromAnswer = !question.isFromAnswer;
				return {
					...question,
					isFromAnswer,
					options: question.type === "RANKING" && isFromAnswer ? [] : question.options,
					sourceQuestionId: isFromAnswer ? question.sourceQuestionId : undefined
				};
			},
			"immediate"
		);
		markQuestionDirty(questionIndex);
	};

	const handleSourceQuestionChange = (questionIndex: number, sourceQuestionId: string) => {
		updateQuestionAt(
			questionIndex,
			question => ({
				...question,
				sourceQuestionId,
				isFromAnswer: true,
				options: question.type === "RANKING" ? [] : question.options
			}),
			"immediate"
		);
		markQuestionDirty(questionIndex);
	};

	const handleRequiredChange = (questionIndex: number, required: boolean) => {
		updateQuestionAt(questionIndex, question => ({ ...question, required }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleUrlChange = (questionIndex: number, url: string) => {
		updateQuestionAt(questionIndex, question => ({ ...question, url }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleOauthProviderChange = (questionIndex: number, provider: "GOOGLE" | "GITHUB") => {
		updateQuestionAt(questionIndex, question => ({ ...question, oauthProvider: provider }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleStartLabelChange = (questionIndex: number, label: string) => {
		updateQuestionAt(questionIndex, question => ({ ...question, startLabel: label }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleEndLabelChange = (questionIndex: number, label: string) => {
		updateQuestionAt(questionIndex, question => ({ ...question, endLabel: label }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleUploadFileTypesChange = (questionIndex: number, nextTypes: string[]) => {
		updateQuestionAt(questionIndex, question => ({ ...question, uploadAllowedFileTypes: nextTypes }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleUploadMaxFileAmountChange = (questionIndex: number, maxAmount: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, uploadMaxFileAmount: maxAmount }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleUploadMaxFileSizeLimitChange = (questionIndex: number, maxFileSizeLimit: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, uploadMaxFileSizeLimit: maxFileSizeLimit }), "immediate");
		markQuestionDirty(questionIndex);
	};

	const handleDateOptionChange = (questionIndex: number, field: "dateHasYear" | "dateHasMonth" | "dateHasDay" | "dateHasMinDate" | "dateHasMaxDate", value: boolean) => {
		const todayStr = new Date().toISOString().split("T")[0];
		updateQuestionAt(
			questionIndex,
			question => {
				const nextQuestion: Question = { ...question, [field]: value };
				if (!value && field === "dateHasMinDate") {
					nextQuestion.dateMinDate = "";
				}
				if (value && field === "dateHasMinDate" && !nextQuestion.dateMinDate) {
					nextQuestion.dateMinDate = todayStr;
				}
				if (!value && field === "dateHasMaxDate") {
					nextQuestion.dateMaxDate = "";
				}
				if (value && field === "dateHasMaxDate" && !nextQuestion.dateMaxDate) {
					nextQuestion.dateMaxDate = todayStr;
				}
				return nextQuestion;
			},
			"immediate"
		);
		markQuestionDirty(questionIndex);
	};

	const handleDateRangeChange = (questionIndex: number, field: "dateMinDate" | "dateMaxDate", value: string) => {
		updateQuestionAt(questionIndex, question => ({ ...question, [field]: value }), "debounced");
		markQuestionDirty(questionIndex);
	};

	const handleDetailOptionChange = (questionIndex: number, optionIndex: number, field: "label" | "description", value: string) => {
		updateQuestionAt(
			questionIndex,
			question => ({
				...question,
				detailOptions: (question.detailOptions ?? []).map((option, currentIndex) => (currentIndex === optionIndex ? { ...option, [field]: value } : option))
			}),
			"debounced"
		);
		markQuestionDirty(questionIndex);
	};

	const handleRemoveDetailOption = (questionIndex: number, optionIndex: number) => {
		updateQuestionAt(questionIndex, question => ({ ...question, detailOptions: question.detailOptions?.filter((_, currentIndex) => currentIndex !== optionIndex) ?? [] }), "immediate");
		markQuestionDirty(questionIndex);
	};

	return (
		<>
			<div className={styles.layout}>
				<div className={styles.content}>
					<Button onClick={handleBack}>返回</Button>
					{sectionsQuery.isLoading && <LoadingSpinner />}
					{sectionsQuery.isError && <ErrorMessage message={(sectionsQuery.error as Error)?.message ?? "無法載入區塊資料"} />}
					<div
						className={styles.container}
						onBlur={event => {
							if (!(event.target instanceof HTMLElement)) return;
							if (event.target.isContentEditable || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
								flushCheckpoint();
							}
						}}
					>
						<section className={styles.card}>
							<Input
								placeholder="區段標題"
								variant="flushed"
								themeColor="--comment"
								textSize="h2"
								value={sectionTitleDraft}
								onChange={event =>
									setEditorState(
										prev => ({
											...prev,
											sectionTitleDraft: event.target.value
										}),
										{ checkpoint: "debounced" }
									)
								}
								onBlur={handleSectionBlurSave}
							/>
							<TextArea
								placeholder="區段描述（支援 Markdown）"
								variant="flushed"
								themeColor="--comment"
								value={sectionDescriptionDraft}
								onChange={event =>
									setEditorState(
										prev => ({
											...prev,
											sectionDescriptionDraft: event.target.value
										}),
										{ checkpoint: "debounced" }
									)
								}
								onBlur={handleSectionBlurSave}
								rows={1}
							/>
						</section>
						{questions.map((question, index) => (
							<QuestionCard
								key={question.clientId}
								question={question}
								questionNumber={index + 1}
								//		defaultExpanded={index === newlyAddedIndex}
								autoFocusTitle={index === newlyAddedIndex}
								duplicateQuestion={() => handleDuplicateQuestion(index)}
								removeQuestion={() => handleDeleteQuestionWithApi(index)}
								onTitleChange={newTitle => handleTitleChange(index, newTitle)}
								onDescriptionChange={newDescription => handleDescriptionChange(index, newDescription)}
								onAddOption={() => handleAddOption(index, { label: "新選項" })}
								onAddOtherOption={() => handleAddOption(index, { label: "其他", isOther: true })}
								onAddDetailOption={() => handleAddDetailOption(index, { label: "新選項", description: "選項說明" })}
								onDetailOptionChange={(optionIndex, field, value) => handleDetailOptionChange(index, optionIndex, field, value)}
								onRemoveDetailOption={optionIndex => handleRemoveDetailOption(index, optionIndex)}
								onRemoveOption={optionIndex => handleRemoveOption(index, optionIndex)}
								onRemoveOtherOption={() =>
									handleRemoveOption(
										index,
										question.options!.findIndex(option => option.isOther)
									)
								}
								onChangeOption={(optionIndex, newLabel) => handleChangeOption(index, optionIndex, newLabel)}
								onStartChange={newStart => handleStartChange(index, newStart)}
								onEndChange={newEnd => handleEndChange(index, newEnd)}
								onStartLabelChange={label => handleStartLabelChange(index, label)}
								onEndLabelChange={label => handleEndLabelChange(index, label)}
								onChangeIcon={newIcon => handleChangeIcon(index, newIcon)}
								onToggleIsFromAnswer={() => handleToggleIsFromAnswer(index)}
								onSourceQuestionChange={sourceId => handleSourceQuestionChange(index, sourceId)}
								sourceQuestionOptions={sourceQuestionOptions}
								sourceQuestionId={question.sourceQuestionId}
								onRequiredChange={required => handleRequiredChange(index, required)}
								onUploadFileTypesChange={types => handleUploadFileTypesChange(index, types)}
								onUploadMaxFileAmountChange={amount => handleUploadMaxFileAmountChange(index, amount)}
								onUploadMaxFileSizeLimitChange={bytes => handleUploadMaxFileSizeLimitChange(index, bytes)}
								onDateOptionChange={(field, checked) => handleDateOptionChange(index, field, checked)}
								onDateRangeChange={(field, nextValue) => handleDateRangeChange(index, field, nextValue)}
								onUrlChange={url => handleUrlChange(index, url)}
								onOauthProviderChange={provider => handleOauthProviderChange(index, provider)}
								onFold={() => {
									flushCheckpoint();
									void flushDirtyQuestions();
								}}
								onTypeChange={nextType => handleQuestionTypeChange(index, nextType)}
							/>
						))}
					</div>
				</div>
				<div className={styles.sidebarContainer}>
					<div className={styles.sidebar}>
						<p>新增</p>
						{Object.values(QUESTION_STRATEGIES).map((option, index) => (
							<button key={index} className={styles.newQuestion} onClick={() => handleAddQuestion(option.type)}>
								{option.icon}
								{option.text}
							</button>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
