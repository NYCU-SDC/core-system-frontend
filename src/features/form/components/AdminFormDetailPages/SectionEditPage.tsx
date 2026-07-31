import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useSectionEditUndo, type SectionEditSnapshot } from "@/features/form/hooks/useSectionEditUndo";
import { useCreateQuestion, useDeleteQuestion, useSections, useUpdateQuestion, useUpdateSection } from "@/features/form/hooks/useSections";
import { useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, Input, LoadingSpinner, MarkdownEditor, Switch, useToast } from "@/shared/components";
import { EMPTY_PROSE_MIRROR_DOC, fromApiProseMirror, serializeProseMirrorDoc, toApiProseMirror, type ProseMirrorLikeDocument } from "@/shared/utils/proseMirror";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormsQuestionRequest, FormsQuestionResponse, ProseMirrorDocument, ProseMirrorDocumentUpdate } from "@nycu-sdc/core-system-sdk";
import { History, Redo2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { QuestionCard } from "./components/QuestionCard";
import { QUESTION_STRATEGIES } from "./QuestionConfig";
import { SectionEditHistoryLog } from "./SectionEditHistoryLog";
import styles from "./SectionEditPage.module.css";
import type { Option, Question } from "./types/question";
import { QUESTION_FEATURES } from "./types/question";

function SortableQuestionItem({ id, children }: { id: string; children: (listeners: React.HTMLAttributes<HTMLElement> | undefined) => ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return (
		<div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }} {...attributes}>
			{children(listeners as React.HTMLAttributes<HTMLElement> | undefined)}
		</div>
	);
}

type ApiQuestionWithOptionalFields = FormsQuestionResponse & {
	url?: string;
	oauthConnect?: Question["oauthProvider"];
};

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
	const sectionBundle = sectionsQuery.data?.find(bundle => bundle.section.id === sectionId);
	const section = sectionBundle?.section;
	const apiQuestions = sectionBundle?.questions ?? [];

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

	// Section title/description autosave separately and do not participate in question undo history.
	const [sectionTitleDraft, setSectionTitleDraft] = useState("");
	const [sectionDescriptionDraft, setSectionDescriptionDraft] = useState<ProseMirrorLikeDocument>(() => EMPTY_PROSE_MIRROR_DOC);
	const [savedSectionTitle, setSavedSectionTitle] = useState("");
	const [savedSectionDescription, setSavedSectionDescription] = useState(() => serializeProseMirrorDoc(EMPTY_PROSE_MIRROR_DOC));
	const questionsRef = useRef<Question[]>([]);
	const questionIdsRef = useRef<(string | undefined)[]>([]);
	const dirtyQuestionIndexesRef = useRef<Set<number>>(new Set());
	const autosaveTimerRef = useRef<number | null>(null);
	const isFlushingDirtyQuestionsRef = useRef(false);
	const flushPromiseRef = useRef<Promise<void> | null>(null);
	const hydratedSectionIdRef = useRef<string | null>(null);
	const [dirtyQuestionVersion, setDirtyQuestionVersion] = useState(0);
	const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);
	const [showHistory, setShowHistory] = useState(false);
	const [expandAll, setExpandAll] = useState(false);
	// Keep the last active card expanded when "collapse all" is toggled.
	const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
	// Hide the fixed-bottom undo bar (mobile) when scrolled to the page bottom so it doesn't cover the footer.
	const [undoBarHidden, setUndoBarHidden] = useState(false);

	useEffect(() => {
		const onScroll = () => setUndoBarHidden(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Use refs to break the undo/redo callback definition cycle.
	const beforeUndoRedoRef = useRef<() => Promise<void>>(async () => {});
	const afterUndoRedoRef = useRef<(snapshot: SectionEditSnapshot) => void>(() => {});

	const { questions, questionIds, setQuestions, updateQuestionAt, setQuestionIds, setSnapshot, hydrate, undo, redo, canUndo, canRedo, onTextInputBlurCheckpoint, history } = useSectionEditUndo(
		{ questions: [], questionIds: [] },
		{
			beforeUndoRedo: () => beforeUndoRedoRef.current(),
			afterUndoRedo: snapshot => afterUndoRedoRef.current(snapshot)
		}
	);

	// Keep questionIdsRef in sync before the next flush step.
	const setQuestionIdsAndRef = useCallback(
		(nextQuestionIds: (string | undefined)[], checkpoint?: "immediate" | "debounced" | "none") => {
			questionIdsRef.current = nextQuestionIds;
			setQuestionIds(nextQuestionIds, checkpoint);
		},
		[setQuestionIds]
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

	const remapDirtyQuestionIndexesAfterMove = useCallback((oldIndex: number, newIndex: number) => {
		if (oldIndex === newIndex || dirtyQuestionIndexesRef.current.size === 0) return;

		const remappedIndexes = new Set<number>();
		dirtyQuestionIndexesRef.current.forEach(index => {
			if (index === oldIndex) {
				remappedIndexes.add(newIndex);
			} else if (oldIndex < newIndex && index > oldIndex && index <= newIndex) {
				remappedIndexes.add(index - 1);
			} else if (oldIndex > newIndex && index >= newIndex && index < oldIndex) {
				remappedIndexes.add(index + 1);
			} else {
				remappedIndexes.add(index);
			}
		});
		dirtyQuestionIndexesRef.current = remappedIndexes;
	}, []);

	const saveSectionIfChanged = useCallback(
		(nextSectionTitle: string, nextSectionDescription: ProseMirrorLikeDocument) => {
			if (!sectionId) return;
			if (nextSectionTitle === savedSectionTitle && serializeProseMirrorDoc(nextSectionDescription) === savedSectionDescription) return;

			updateSectionMutation.mutate(
				{ title: nextSectionTitle, description: toApiProseMirror(nextSectionDescription) as unknown as ProseMirrorDocumentUpdate },
				{
					onSuccess: () => {
						setSavedSectionTitle(nextSectionTitle);
						setSavedSectionDescription(serializeProseMirrorDoc(nextSectionDescription));
						if (workflowQuery.data?.workflow) {
							const updatedNodes = workflowQuery.data.workflow.map(n => (n.id === sectionId ? { ...n, label: nextSectionTitle } : n));
							updateWorkflowMutation.mutate(
								updatedNodes.map(n => ({
									id: n.id,
									label: n.label,
									payload: n.payload,
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
		saveSectionIfChanged(sectionTitleDraft, sectionDescriptionDraft);
	}, [saveSectionIfChanged, sectionDescriptionDraft, sectionId, sectionTitleDraft]);

	const toApiRequest = (q: Question, order: number): FormsQuestionRequest => {
		const base: FormsQuestionRequest = {
			type: q.type as FormsQuestionRequest["type"],
			title: q.title,
			description: toApiProseMirror(q.description ?? EMPTY_PROSE_MIRROR_DOC) as unknown as ProseMirrorDocument,
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
		if (isFlushingDirtyQuestionsRef.current) {
		// Wait for the current flush to finish.
			if (flushPromiseRef.current) await flushPromiseRef.current;
			return;
		}
		if (dirtyQuestionIndexesRef.current.size === 0) return;

		isFlushingDirtyQuestionsRef.current = true;
		const run = (async () => {
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
									description: fromApiProseMirror(apiQuestion.description) ?? old.description,
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
						// Redoing a newly created question may re-POST because its snapshot id is still undefined.
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
				flushPromiseRef.current = null;
			}
		})();
		flushPromiseRef.current = run;
		await run;
	}, [createQuestion, formid, sectionId, setQuestionIdsAndRef, setQuestions, updateQuestion]);

	// Finish pending autosave before undo/redo.
	const awaitInFlightFlush = useCallback(async () => {
		if (autosaveTimerRef.current !== null) {
			window.clearTimeout(autosaveTimerRef.current);
			autosaveTimerRef.current = null;
		}
		await flushDirtyQuestions();
		if (flushPromiseRef.current) await flushPromiseRef.current;
	}, [flushDirtyQuestions]);

	// Mark restored questions dirty after undo/redo.
	const markAllQuestionsDirty = useCallback(
		(snapshot: SectionEditSnapshot) => {
			markQuestionsDirtyFrom(0, snapshot.questions.length);
		},
		[markQuestionsDirtyFrom]
	);

	beforeUndoRedoRef.current = awaitInFlightFlush;
	afterUndoRedoRef.current = markAllQuestionsDirty;

	// Effects
	// Hydrate from API. The sections query is invalidated after every autosave create/update/
	// delete, so this effect re-fires whenever the server question count changes — NOT only on
	// first load. We therefore distinguish:
	//   - first hydration of a section -> seed the undo baseline (clears past/future).
	//   - later server reconciliation  -> merge with checkpoint "none" so it neither pollutes
	//     the undo stack nor wipes history (which a re-seed would).
	useEffect(() => {
		if (!section?.id) return;

		const mapped: Question[] = apiQuestions.map(q => {
			const apiQuestion = q as ApiQuestionWithOptionalFields;
			const existingQuestionIndex = questionIdsRef.current.findIndex(questionId => questionId === q.id);
			const existingQuestion = existingQuestionIndex >= 0 ? questionsRef.current[existingQuestionIndex] : undefined;

			return {
				clientId: existingQuestion?.clientId ?? q.id ?? uuidv4(),
				type: q.type as Question["type"],
				title: q.title,
				description: fromApiProseMirror(q.description),
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
		const nextQuestionIds = apiQuestions.map(q => q.id);

		if (hydratedSectionIdRef.current !== section.id) {
			hydratedSectionIdRef.current = section.id;
			dirtyQuestionIndexesRef.current.clear();
			questionsRef.current = mapped;
			questionIdsRef.current = nextQuestionIds;
			hydrate({ questions: mapped, questionIds: nextQuestionIds });
		} else {
			setQuestions(mapped, "none");
			setQuestionIdsAndRef(nextQuestionIds, "none");
		}
		// Re-run only when section identity or question count changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiQuestions.length, section?.id]);

	useEffect(() => {
		questionsRef.current = questions;
	}, [questions]);

	useEffect(() => {
		questionIdsRef.current = questionIds;
	}, [questionIds]);

	useEffect(() => {
		setSectionTitleDraft(section?.title ?? "");
		setSectionDescriptionDraft(fromApiProseMirror(section?.description));
		setSavedSectionTitle(section?.title ?? "");
		setSavedSectionDescription(serializeProseMirrorDoc(fromApiProseMirror(section?.description)));
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

	const sourceQuestionOptions = useMemo(
		() =>
			(sectionsQuery.data ?? []).flatMap(sectionItem =>
				(sectionItem.questions ?? [])
					.filter(
						(question: FormsQuestionResponse) =>
							question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE" || question.type === "DETAILED_MULTIPLE_CHOICE" || question.type === "DROPDOWN"
					)
					.map((question: FormsQuestionResponse) => ({
						value: question.id,
						label: `${sectionItem.section.title} / ${question.title}`
					}))
			),
		[sectionsQuery.data]
	);

	const clientIds = useMemo(() => questions.map((question, index) => question.clientId ?? questionIds[index] ?? `question-${index}`), [questions, questionIds]);

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
			description: prev.description ?? EMPTY_PROSE_MIRROR_DOC,
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
			description: EMPTY_PROSE_MIRROR_DOC,
			required: false,
			isFromAnswer: false,
			...strategy.initialState()
		};

		const updatedQuestions = [...questions, newQuestion];
		// Reset undo history after adding a question.
		hydrate({ questions: updatedQuestions, questionIds: [...questionIds, undefined] });
		setNewlyAddedIndex(newIndex);
		markQuestionDirty(newIndex);
	};

	const handleRemoveQuestion = (index: number) => {
		const updatedQuestions = questions.filter((_, currentIndex) => currentIndex !== index);
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index, 1);
		// Reset undo history because this change is not safely undoable.
		hydrate({ questions: updatedQuestions, questionIds: updatedQuestionIds });
		markQuestionsDirtyFrom(index, updatedQuestions.length);
	};

	const handleDuplicateQuestion = (index: number) => {
		const updatedQuestions = questions.flatMap((question, currentIndex) => {
			if (currentIndex !== index) return [question];
			return [question, { ...structuredClone(question), clientId: uuidv4() }];
		});
		const updatedQuestionIds = [...questionIds];
		updatedQuestionIds.splice(index + 1, 0, undefined);
		// Reset undo history after duplicating a question.
		hydrate({ questions: updatedQuestions, questionIds: updatedQuestionIds });
		markQuestionsDirtyFrom(index + 1, updatedQuestions.length);
	};

	const handleTitleChange = (index: number, newTitle: string) => {
		if (questions[index]?.title === newTitle) return;
		updateQuestionAt(index, question => ({ ...question, title: newTitle }), "debounced");
		markQuestionDirty(index);
	};

	const handleDescriptionChange = (index: number, newDescription: ProseMirrorLikeDocument) => {
		// Ignore unchanged descriptions to avoid redundant autosave work.
		if (serializeProseMirrorDoc(questions[index]?.description) === serializeProseMirrorDoc(newDescription)) return;
		// Debounce description updates so repeated editor events collapse into one save step.
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

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = clientIds.indexOf(active.id as string);
			const newIndex = clientIds.indexOf(over.id as string);
			if (oldIndex === -1 || newIndex === -1) return;

			// Capture the dragged item before reordering state.
			const draggedQuestion = questionsRef.current[oldIndex];
			const draggedQuestionId = questionIdsRef.current[oldIndex];

			// Keep question order and ids aligned in one undo step.
			setSnapshot(prev => ({ questions: arrayMove(prev.questions, oldIndex, newIndex), questionIds: arrayMove(prev.questionIds, oldIndex, newIndex) }), "immediate");
			questionIdsRef.current = arrayMove(questionIdsRef.current, oldIndex, newIndex);
			remapDirtyQuestionIndexesAfterMove(oldIndex, newIndex);

			if (draggedQuestionId && draggedQuestion) {
				// Persist only the dragged question; the backend shifts the rest.
				updateQuestion.mutate(
					{ questionId: draggedQuestionId, req: toApiRequest(draggedQuestion, newIndex + 1) },
					{
						onError: err => {
							pushToast({ title: "排序失敗", description: (err as Error).message, variant: "error" });
							setSnapshot(prev => ({ questions: arrayMove(prev.questions, newIndex, oldIndex), questionIds: arrayMove(prev.questionIds, newIndex, oldIndex) }), "immediate");
							questionIdsRef.current = arrayMove(questionIdsRef.current, newIndex, oldIndex);
							remapDirtyQuestionIndexesAfterMove(newIndex, oldIndex);
						}
					}
				);
			} else if (draggedQuestion) {
				// Let autosave create the reordered question.
				markQuestionDirty(newIndex);
			}
		},
		[clientIds, questionsRef, questionIdsRef, updateQuestion, pushToast, setSnapshot, remapDirtyQuestionIndexesAfterMove, markQuestionDirty]
	);

	return (
		<>
			<div className={styles.layout}>
				<div className={styles.content}>
					<div className={styles.toolbar}>
						<Button onClick={handleBack}>返回總覽</Button>
						<div className={styles.expandAllToggle}>
							<span className={styles.expandAllLabel}>全部展開</span>
							<Switch checked={expandAll} onCheckedChange={setExpandAll} themeColor="var(--orange)" />
						</div>
					</div>
					{sectionsQuery.isLoading && <LoadingSpinner />}
					{sectionsQuery.isError && <ErrorMessage message={(sectionsQuery.error as Error)?.message ?? "無法載入區塊資料"} />}
					{/* Flush pending text checkpoints on blur so edits become discrete undo steps. */}
					<div className={styles.container} onBlurCapture={onTextInputBlurCheckpoint}>
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
							<MarkdownEditor
								placeholder="區段描述（支援 Markdown）"
								variant="flushed"
								themeColor="--comment"
								value={sectionDescriptionDraft}
								onChange={setSectionDescriptionDraft}
								onBlur={handleSectionBlurSave}
							/>
						</section>
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={clientIds} strategy={verticalListSortingStrategy}>
								{questions.map((question, index) => (
									<SortableQuestionItem key={clientIds[index]} id={clientIds[index]}>
										{listeners => (
											<QuestionCard
												question={question}
												questionNumber={index + 1}
												defaultExpanded={index === newlyAddedIndex}
												expandAll={expandAll}
												keepExpandedOnCollapse={index === activeCardIndex}
												onActivate={() => setActiveCardIndex(index)}
												autoFocusTitle={index === newlyAddedIndex}
												dragHandleListeners={listeners}
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
										)}
									</SortableQuestionItem>
								))}
							</SortableContext>
						</DndContext>
					</div>
				</div>
				<div className={styles.sidebarContainer}>
					<div className={`${styles.undoBar} ${undoBarHidden ? styles.undoBarHidden : ""}`}>
						<button type="button" className={styles.undoBarBtn} onClick={() => void undo()} disabled={!canUndo} aria-label="復原" title="復原">
							<Undo2 size={18} />
						</button>
						<button type="button" className={styles.undoBarBtn} onClick={() => void redo()} disabled={!canRedo} aria-label="重做" title="重做">
							<Redo2 size={18} />
						</button>
						<button type="button" className={styles.undoBarBtn} onClick={() => setShowHistory(prev => !prev)} aria-label="步驟紀錄" title="步驟紀錄">
							<History size={18} />
						</button>
					</div>
					{showHistory && <SectionEditHistoryLog history={history} />}
					<div className={styles.sidebar}>
						<p>新增</p>
						{Object.values(QUESTION_STRATEGIES).map((option, index) => (
							<button key={index} className={styles.newQuestion} onClick={() => handleAddQuestion(option.type)} title={option.text}>
								{option.icon}
								<span className={styles.newQuestionLabel}>{option.text}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
