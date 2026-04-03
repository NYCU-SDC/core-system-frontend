import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useCreateQuestion, useDeleteQuestion, useSections, useUpdateQuestion, useUpdateSection } from "@/features/form/hooks/useSections";
import { useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, Input, LoadingSpinner, TextArea, useToast } from "@/shared/components";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormsQuestionRequest, FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { GripVertical } from "lucide-react";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { QuestionCard } from "./components/QuestionCard";
import { QUESTION_STRATEGIES } from "./QuestionConfig";
import styles from "./SectionEditPage.module.css";
import type { Option, Question } from "./types/question";
import { QUESTION_FEATURES } from "./types/question";

function SortableQuestionItem({ id, children }: { id: string; children: ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return (
		<div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }} {...attributes}>
			<div className={styles.questionDragHandle} {...listeners}>
				<GripVertical size={16} />
			</div>
			{children}
		</div>
	);
}

type ApiQuestionWithOptionalFields = FormsQuestionResponse & {
	url?: string;
	oauthConnect?: Question["oauthProvider"];
};

export const AdminSectionEditPage = () => {
	const { formid, sectionId } = useParams<{ formid: string; sectionId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const orgSlug = useActiveOrgSlug();

	const sectionsQuery = useSections(formid);
	const section = sectionsQuery.data?.flatMap(response => (Array.isArray(response.sections) ? response.sections : [])).find(foundSection => foundSection.id === sectionId);
	const apiQuestions = section?.questions ?? [];

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
	const [questions, setQuestions] = useState<Question[]>([]);
	const [questionIds, setQuestionIds] = useState<(string | undefined)[]>([]);
	const [clientIds, setClientIds] = useState<string[]>([]);
	const [sectionTitleDraft, setSectionTitleDraft] = useState("");
	const [sectionDescriptionDraft, setSectionDescriptionDraft] = useState("");
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
	const setQuestionIdsAndRef = useCallback((nextQuestionIds: (string | undefined)[]) => {
		questionIdsRef.current = nextQuestionIds;
		setQuestionIds(nextQuestionIds);
	}, []);

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
					}
				}
			);
		},
		[sectionId, savedSectionTitle, savedSectionDescription, updateSectionMutation, workflowQuery.data, updateWorkflowMutation, pushToast]
	);

	const handleSectionBlurSave = useCallback(() => {
		if (!sectionId) return;
		saveSectionIfChanged(sectionTitleDraft, sectionDescriptionDraft);
	}, [sectionId, saveSectionIfChanged, sectionTitleDraft, sectionDescriptionDraft]);

	const flushDirtyQuestions = useCallback(async () => {
		if (!formid || !sectionId) return;
		if (isFlushingDirtyQuestionsRef.current) return;
		if (dirtyQuestionIndexesRef.current.size === 0) return;

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
						});
					};
					if (existingId) {
						const updated = await updateQuestion.mutateAsync({ questionId: existingId, req });
						syncQuestionFromApi(updated);
					} else {
						const res = await createQuestion.mutateAsync(req);
						syncQuestionFromApi(res);
						const nextQuestionIds = [...questionIdsRef.current];
						nextQuestionIds[index] = res.id;
						setQuestionIdsAndRef(nextQuestionIds);
					}
				}
			}
		} catch (err) {
			pushToast({ title: "儲存失敗", description: (err as Error).message, variant: "error" });
		} finally {
			isFlushingDirtyQuestionsRef.current = false;
		}
	}, [formid, sectionId, updateQuestion, createQuestion, pushToast, setQuestionIdsAndRef]);

	// Effects
	// Sync from API on first load
	useEffect(() => {
		if (apiQuestions.length > 0 && questions.length === 0) {
			const mapped: Question[] = apiQuestions.map(q => {
				const apiQuestion = q as ApiQuestionWithOptionalFields;

				return {
					type: q.type as Question["type"],
					title: q.title,
					description: q.description ?? "",
					required: q.required ?? false,
					isFromAnswer: Boolean(q.sourceId),
					sourceQuestionId: q.sourceId,
					options: q.choices?.map(c => ({ id: c.id, label: c.name ?? "", isOther: c.isOther ?? false })),
					detailOptions: q.choices?.map(c => ({ id: c.id, label: c.name ?? "", description: c.description ?? "" })),
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
			setQuestions(mapped);
			setQuestionIdsAndRef(apiQuestions.map(q => q.id));
			setClientIds(apiQuestions.map(q => q.id));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiQuestions.length]);

	useEffect(() => {
		questionsRef.current = questions;
	}, [questions]);

	useEffect(() => {
		questionIdsRef.current = questionIds;
	}, [questionIds]);

	useEffect(() => {
		setSectionTitleDraft(section?.title ?? "");
		setSectionDescriptionDraft(section?.description ?? "");
		setSavedSectionTitle(section?.title ?? "");
		setSavedSectionDescription(section?.description ?? "");
	}, [section?.id, section?.title, section?.description]);

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
			nextQuestion.detailOptions = prev.options.map(o => ({ id: o.id, label: o.label, description: "" }));
			delete nextQuestion.options;
		}

		updatedQuestions[index] = nextQuestion;

		setQuestions(updatedQuestions);
		markQuestionDirty(index);
	};

	const handleDeleteQuestionWithApi = async (index: number) => {
		const existingId = questionIds[index];
		if (existingId) {
			try {
				await deleteQuestion.mutateAsync(existingId);
			} catch (err) {
				pushToast({ title: "刪除失敗", description: (err as Error).message, variant: "error" });
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
			type,
			title: "問題標題",
			description: "",
			required: false,
			isFromAnswer: false,
			...strategy.initialState()
		};

		const updatedQuestions = [...questions, newQuestion];
		setQuestions(updatedQuestions);
		setClientIds(prev => [...prev, uuidv4()]);
		setNewlyAddedIndex(newIndex);
		markQuestionDirty(newIndex);
	};

	const handleRemoveQuestion = (index: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions.splice(index, 1);
		setQuestions(updatedQuestions);
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index, 1);
		setQuestionIdsAndRef(updatedQuestionIds);
		setClientIds(prev => {
			const next = [...prev];
			next.splice(index, 1);
			return next;
		});
		markQuestionsDirtyFrom(index, updatedQuestions.length);
	};

	const handleDuplicateQuestion = (index: number) => {
		const updatedQuestions = [...questions];
		const questionToDuplicate = updatedQuestions[index];
		updatedQuestions.splice(index + 1, 0, { ...questionToDuplicate });
		setQuestions(updatedQuestions);
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index + 1, 0, undefined);
		setQuestionIdsAndRef(updatedQuestionIds);
		setClientIds(prev => {
			const next = [...prev];
			next.splice(index + 1, 0, uuidv4());
			return next;
		});
		markQuestionsDirtyFrom(index + 1, updatedQuestions.length);
	};

	const handleTitleChange = (index: number, newTitle: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[index].title = newTitle;
		setQuestions(updatedQuestions);
		markQuestionDirty(index);
	};

	const handleDescriptionChange = (index: number, newDescription: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[index].description = newDescription;
		setQuestions(updatedQuestions);
		markQuestionDirty(index);
	};

	const handleAddOption = (questionIndex: number, newOption: Option) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			updatedQuestions[questionIndex].options = [];
		}

		const optionWithId: Option = { id: uuidv4(), ...newOption };
		const otherOptionIndex = updatedQuestions[questionIndex].options!.findIndex(option => option.isOther);
		if (optionWithId.isOther) {
			if (otherOptionIndex === -1) {
				updatedQuestions[questionIndex].options!.push(optionWithId);
			}
		} else {
			if (otherOptionIndex !== -1) {
				updatedQuestions[questionIndex].options!.splice(otherOptionIndex, 0, optionWithId);
			} else {
				updatedQuestions[questionIndex].options!.push(optionWithId);
			}
		}

		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleAddDetailOption = (questionIndex: number, newDetailOption: { label: string; description: string }) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].detailOptions) {
			updatedQuestions[questionIndex].detailOptions = [];
		}
		updatedQuestions[questionIndex].detailOptions!.push({ id: uuidv4(), ...newDetailOption });
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			return;
		}
		updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleChangeOption = (questionIndex: number, optionIndex: number, newLabel: string) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			updatedQuestions[questionIndex].options = [];
		}
		updatedQuestions[questionIndex].options![optionIndex] = {
			...updatedQuestions[questionIndex].options![optionIndex],
			label: newLabel
		};
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleStartChange = (questionIndex: number, newStart: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].start = newStart;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleEndChange = (questionIndex: number, newEnd: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].end = newEnd;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleChangeIcon = (questionIndex: number, newIcon: Question["icon"]) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].icon = newIcon;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleToggleIsFromAnswer = (questionIndex: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].isFromAnswer = !updatedQuestions[questionIndex].isFromAnswer;
		if (updatedQuestions[questionIndex].type === "RANKING" && updatedQuestions[questionIndex].isFromAnswer) {
			updatedQuestions[questionIndex].options = [];
		}
		if (!updatedQuestions[questionIndex].isFromAnswer) {
			updatedQuestions[questionIndex].sourceQuestionId = undefined;
		}
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleSourceQuestionChange = (questionIndex: number, sourceQuestionId: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].sourceQuestionId = sourceQuestionId;
		updatedQuestions[questionIndex].isFromAnswer = true;
		if (updatedQuestions[questionIndex].type === "RANKING") {
			updatedQuestions[questionIndex].options = [];
		}
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleRequiredChange = (questionIndex: number, required: boolean) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].required = required;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleUrlChange = (questionIndex: number, url: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].url = url;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleOauthProviderChange = (questionIndex: number, provider: "GOOGLE" | "GITHUB") => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].oauthProvider = provider;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleStartLabelChange = (questionIndex: number, label: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].startLabel = label;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleEndLabelChange = (questionIndex: number, label: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].endLabel = label;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleUploadFileTypesChange = (questionIndex: number, nextTypes: string[]) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].uploadAllowedFileTypes = nextTypes;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleUploadMaxFileAmountChange = (questionIndex: number, maxAmount: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].uploadMaxFileAmount = maxAmount;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleUploadMaxFileSizeLimitChange = (questionIndex: number, maxFileSizeLimit: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].uploadMaxFileSizeLimit = maxFileSizeLimit;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleDateOptionChange = (questionIndex: number, field: "dateHasYear" | "dateHasMonth" | "dateHasDay" | "dateHasMinDate" | "dateHasMaxDate", value: boolean) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex][field] = value;
		const todayStr = new Date().toISOString().split("T")[0];
		if (!value && field === "dateHasMinDate") {
			updatedQuestions[questionIndex].dateMinDate = "";
		}
		if (value && field === "dateHasMinDate" && !updatedQuestions[questionIndex].dateMinDate) {
			updatedQuestions[questionIndex].dateMinDate = todayStr;
		}
		if (!value && field === "dateHasMaxDate") {
			updatedQuestions[questionIndex].dateMaxDate = "";
		}
		if (value && field === "dateHasMaxDate" && !updatedQuestions[questionIndex].dateMaxDate) {
			updatedQuestions[questionIndex].dateMaxDate = todayStr;
		}
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleDateRangeChange = (questionIndex: number, field: "dateMinDate" | "dateMaxDate", value: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex][field] = value;
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleDetailOptionChange = (questionIndex: number, optionIndex: number, field: "label" | "description", value: string) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].detailOptions) return;
		updatedQuestions[questionIndex].detailOptions![optionIndex] = {
			...updatedQuestions[questionIndex].detailOptions![optionIndex],
			[field]: value
		};
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const handleRemoveDetailOption = (questionIndex: number, optionIndex: number) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].detailOptions) return;
		updatedQuestions[questionIndex].detailOptions!.splice(optionIndex, 1);
		setQuestions(updatedQuestions);
		markQuestionDirty(questionIndex);
	};

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = clientIds.indexOf(active.id as string);
			const newIndex = clientIds.indexOf(over.id as string);
			if (oldIndex === -1 || newIndex === -1) return;

			setQuestions(prev => arrayMove(prev, oldIndex, newIndex));
			setQuestionIdsAndRef(arrayMove(questionIds, oldIndex, newIndex));
			setClientIds(prev => arrayMove(prev, oldIndex, newIndex));

			const minIndex = Math.min(oldIndex, newIndex);
			markQuestionsDirtyFrom(minIndex, questions.length);
		},
		[clientIds, questionIds, questions.length, setQuestionIdsAndRef, markQuestionsDirtyFrom]
	);

	return (
		<>
			<div className={styles.layout}>
				<div className={styles.content}>
					<Button onClick={handleBack}>返回</Button>
					{sectionsQuery.isLoading && <LoadingSpinner />}
					{sectionsQuery.isError && <ErrorMessage message={(sectionsQuery.error as Error)?.message ?? "無法載入區塊資料"} />}
					<div className={styles.container}>
						<section className={styles.card}>
							<Input
								placeholder="區段標題"
								variant="flushed"
								themeColor="--comment"
								textSize="h2"
								value={sectionTitleDraft}
								onChange={event => setSectionTitleDraft(event.target.value)}
								onBlur={handleSectionBlurSave}
							/>
							<TextArea
								placeholder="區段描述（支援 Markdown）"
								variant="flushed"
								themeColor="--comment"
								value={sectionDescriptionDraft}
								onChange={event => setSectionDescriptionDraft(event.target.value)}
								onBlur={handleSectionBlurSave}
								rows={1}
							/>
						</section>
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={clientIds} strategy={verticalListSortingStrategy}>
								{questions.map((question, index) => (
									<SortableQuestionItem key={clientIds[index] ?? index} id={clientIds[index] ?? String(index)}>
										<QuestionCard
											question={question}
											questionNumber={index + 1}
											defaultExpanded={index === newlyAddedIndex}
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
												void flushDirtyQuestions();
											}}
											onTypeChange={nextType => handleQuestionTypeChange(index, nextType)}
										/>
									</SortableQuestionItem>
								))}
							</SortableContext>
						</DndContext>
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
