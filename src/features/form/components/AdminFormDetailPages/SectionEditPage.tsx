import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useCreateQuestion, useDeleteQuestion, useSections, useUpdateQuestion, useUpdateSection } from "@/features/form/hooks/useSections";
import { useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, Input, LoadingSpinner, TextArea, useToast } from "@/shared/components";
import type { FormsAllowedFileTypes, FormsQuestionRequest, FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { Calendar, CaseSensitive, CloudUpload, Ellipsis, LayoutList, Link2, List, ListOrdered, Rows3, ShieldCheck, SquareCheckBig, Star, TextAlignStart } from "lucide-react";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./SectionEditPage.module.css";
import { QuestionCard } from "./components/SectionEditor/QuestionCard";
import type { Option, Question } from "./types/option";

type NewQuestion = {
	icon: React.ReactNode;
	text: string;
	type: Question["type"];
	setDefaultQuestion: () => Question;
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

	const [questions, setQuestions] = useState<Question[]>([]);
	const [questionIds, setQuestionIds] = useState<(string | undefined)[]>([]);
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

	// Sync from API on first load
	useEffect(() => {
		if (apiQuestions.length > 0 && questions.length === 0) {
			const mapped: Question[] = apiQuestions.map(q => ({
				type: q.type as Question["type"],
				title: q.title,
				description: q.description ?? "",
				required: q.required ?? false,
				isFromAnswer: Boolean(q.sourceId),
				sourceQuestionId: q.sourceId,
				options: q.choices?.map(c => ({ label: c.name ?? "", isOther: c.isOther ?? false })),
				detailOptions: q.choices?.map(c => ({ label: c.name ?? "", description: c.description ?? "" })),
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
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				url: (q as any).url ?? "",
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				oauthProvider: (q as any).oauthConnect as Question["oauthProvider"] | undefined
			}));
			setQuestions(mapped);
			setQuestionIdsAndRef(apiQuestions.map(q => q.id));
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

	const toApiRequest = (q: Question, order: number): FormsQuestionRequest => {
		const normalizeDateToUtc = (dateInput: string, endOfDay = false) => {
			if (!dateInput) return undefined;
			const suffix = endOfDay ? "T23:59:59Z" : "T00:00:00Z";
			return `${dateInput}${suffix}`;
		};

		const base: FormsQuestionRequest = {
			type: q.type as FormsQuestionRequest["type"],
			title: q.title,
			description: q.description ? (marked.parse(q.description) as string) : q.description,
			required: q.required ?? false,
			order
		};
		if (q.options && q.type !== "DETAILED_MULTIPLE_CHOICE") {
			base.choices = q.options.map(o => ({ name: o.label, isOther: o.isOther ?? false }));
		}
		if (q.type === "DETAILED_MULTIPLE_CHOICE" && q.detailOptions) {
			base.choices = q.detailOptions.map(o => ({ name: o.label, description: o.description ? (marked.parse(o.description) as string) : o.description }));
		}
		if (q.start !== undefined) {
			base.scale = {
				minVal: q.start,
				maxVal: q.end ?? 5,
				icon: q.icon
			};
			if (q.startLabel !== undefined) base.scale.minValueLabel = q.startLabel;
			if (q.endLabel !== undefined) base.scale.maxValueLabel = q.endLabel;
		}
		if (q.type === "UPLOAD_FILE") {
			base.uploadFile = {
				allowedFileTypes: (q.uploadAllowedFileTypes?.length ? q.uploadAllowedFileTypes : ["PDF"]) as FormsAllowedFileTypes[],
				maxFileAmount: q.uploadMaxFileAmount ?? 1,
				maxFileSizeLimit: q.uploadMaxFileSizeLimit ?? 10485760
			};
		}
		if (q.type === "DATE") {
			base.date = {
				hasYear: q.dateHasYear ?? true,
				hasMonth: q.dateHasMonth ?? true,
				hasDay: q.dateHasDay ?? true,
				...(q.dateHasMinDate ? { minDate: normalizeDateToUtc(q.dateMinDate ?? "") } : {}),
				...(q.dateHasMaxDate ? { maxDate: normalizeDateToUtc(q.dateMaxDate ?? "", true) } : {})
			};
		}
		// HYPERLINK url field
		if (q.type === "HYPERLINK" && q.url !== undefined) {
			(base as unknown as Record<string, unknown>).url = q.url;
		}
		// OAUTH_CONNECT provider field
		if (q.type === "OAUTH_CONNECT") {
			base.oauthConnect = (q.oauthProvider ?? "GITHUB") as FormsQuestionRequest["oauthConnect"];
		}
		if (q.isFromAnswer && q.sourceQuestionId) {
			base.sourceId = q.sourceQuestionId;
		}
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
							const next = [...prev];
							const target = next[index];
							target.title = apiQuestion.title ?? target.title;
							target.description = apiQuestion.description ?? target.description;
							target.required = apiQuestion.required ?? target.required;
							if (apiQuestion.sourceId !== undefined) {
								target.sourceQuestionId = apiQuestion.sourceId ?? undefined;
								target.isFromAnswer = Boolean(apiQuestion.sourceId);
							}
							target.icon = apiQuestion.scale?.icon ?? target.icon;
							target.start = apiQuestion.scale?.minVal ?? target.start;
							target.end = apiQuestion.scale?.maxVal ?? target.end;
							target.startLabel = apiQuestion.scale?.minValueLabel ?? target.startLabel;
							target.endLabel = apiQuestion.scale?.maxValueLabel ?? target.endLabel;
							target.uploadAllowedFileTypes = apiQuestion.uploadFile?.allowedFileTypes ? [...apiQuestion.uploadFile.allowedFileTypes] : target.uploadAllowedFileTypes;
							target.uploadMaxFileAmount = apiQuestion.uploadFile?.maxFileAmount ?? target.uploadMaxFileAmount;
							target.uploadMaxFileSizeLimit = apiQuestion.uploadFile?.maxFileSizeLimit ?? target.uploadMaxFileSizeLimit;
							target.dateHasYear = apiQuestion.date?.hasYear ?? target.dateHasYear;
							target.dateHasMonth = apiQuestion.date?.hasMonth ?? target.dateHasMonth;
							target.dateHasDay = apiQuestion.date?.hasDay ?? target.dateHasDay;
							target.dateHasMinDate = Boolean(apiQuestion.date?.minDate);
							target.dateHasMaxDate = Boolean(apiQuestion.date?.maxDate);
							target.dateMinDate = apiQuestion.date?.minDate ? apiQuestion.date.minDate.slice(0, 10) : "";
							target.dateMaxDate = apiQuestion.date?.maxDate ? apiQuestion.date.maxDate.slice(0, 10) : "";

							if (target.type === "DETAILED_MULTIPLE_CHOICE" && apiQuestion.choices) {
								target.detailOptions = apiQuestion.choices.map(choice => ({
									label: choice.name ?? "",
									description: choice.description ?? ""
								}));
							} else if (apiQuestion.choices) {
								target.options = apiQuestion.choices.map(choice => ({
									label: choice.name ?? "",
									isOther: choice.isOther ?? false
								}));
							}

							questionsRef.current = next;
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

	const handleQuestionTypeChange = (index: number, nextType: Question["type"]) => {
		const updatedQuestions = [...questions];
		const prev = updatedQuestions[index];
		if (!prev || prev.type === nextType) return;

		const template = newQuestionOptions.find(option => option.type === nextType)?.setDefaultQuestion();
		if (!template) return;

		const nextQuestion: Question = {
			...template,
			title: prev.title,
			description: prev.description,
			required: prev.required,
			isFromAnswer: prev.isFromAnswer
		};

		const choicesTypeSet: Question["type"][] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "RANKING"];
		const scaleTypeSet: Question["type"][] = ["LINEAR_SCALE", "RATING"];

		if (choicesTypeSet.includes(nextType)) {
			nextQuestion.options = prev.options ? [...prev.options] : nextQuestion.options;
		}

		if (nextType === "DETAILED_MULTIPLE_CHOICE") {
			nextQuestion.detailOptions = prev.detailOptions ? [...prev.detailOptions] : (prev.options ?? []).map(option => ({ label: option.label, description: "" }));
		}

		if (scaleTypeSet.includes(nextType)) {
			nextQuestion.start = prev.start ?? nextQuestion.start;
			nextQuestion.end = prev.end ?? nextQuestion.end;
			nextQuestion.startLabel = prev.startLabel ?? nextQuestion.startLabel;
			nextQuestion.endLabel = prev.endLabel ?? nextQuestion.endLabel;
		}

		if (nextType === "RATING") {
			nextQuestion.icon = prev.icon ?? nextQuestion.icon ?? "star";
		}

		if (nextType === "UPLOAD_FILE") {
			nextQuestion.uploadAllowedFileTypes = prev.uploadAllowedFileTypes ?? nextQuestion.uploadAllowedFileTypes ?? ["PDF"];
			nextQuestion.uploadMaxFileAmount = prev.uploadMaxFileAmount ?? nextQuestion.uploadMaxFileAmount ?? 1;
			nextQuestion.uploadMaxFileSizeLimit = prev.uploadMaxFileSizeLimit ?? nextQuestion.uploadMaxFileSizeLimit ?? 10485760;
		}

		if (nextType === "DATE") {
			nextQuestion.dateHasYear = prev.dateHasYear ?? nextQuestion.dateHasYear ?? true;
			nextQuestion.dateHasMonth = prev.dateHasMonth ?? nextQuestion.dateHasMonth ?? true;
			nextQuestion.dateHasDay = prev.dateHasDay ?? nextQuestion.dateHasDay ?? true;
			nextQuestion.dateHasMinDate = prev.dateHasMinDate ?? nextQuestion.dateHasMinDate ?? false;
			nextQuestion.dateHasMaxDate = prev.dateHasMaxDate ?? nextQuestion.dateHasMaxDate ?? false;
			nextQuestion.dateMinDate = prev.dateMinDate ?? nextQuestion.dateMinDate ?? "";
			nextQuestion.dateMaxDate = prev.dateMaxDate ?? nextQuestion.dateMaxDate ?? "";
		}

		if (nextType === "HYPERLINK") {
			nextQuestion.url = prev.url ?? nextQuestion.url ?? "";
		}

		if (nextType === "OAUTH_CONNECT") {
			nextQuestion.oauthProvider = prev.oauthProvider ?? nextQuestion.oauthProvider ?? "GITHUB";
		}

		if (nextType === "RANKING") {
			nextQuestion.isFromAnswer = prev.isFromAnswer;
			nextQuestion.sourceQuestionId = prev.sourceQuestionId;
		}

		updatedQuestions[index] = nextQuestion;
		setQuestions(updatedQuestions);
		markQuestionDirty(index);
	};

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

	const newQuestionOptions: NewQuestion[] = [
		{
			icon: <CaseSensitive />,
			text: "文字簡答",
			type: "SHORT_TEXT",
			setDefaultQuestion: () => {
				return { type: "SHORT_TEXT", title: "", description: "", required: false, isFromAnswer: false };
			}
		},
		{ icon: <TextAlignStart />, text: "文字詳答", type: "LONG_TEXT", setDefaultQuestion: () => ({ type: "LONG_TEXT", title: "", description: "", required: false, isFromAnswer: false }) },
		{
			icon: <List />,
			text: "單選選擇題",
			type: "SINGLE_CHOICE",
			setDefaultQuestion: () => ({ type: "SINGLE_CHOICE", title: "", description: "", required: false, options: [{ label: "選項 1" }], isFromAnswer: false })
		},
		{
			icon: <SquareCheckBig />,
			text: "核取方塊",
			type: "MULTIPLE_CHOICE",
			setDefaultQuestion: () => ({ type: "MULTIPLE_CHOICE", title: "", description: "", required: false, options: [{ label: "選項 1" }], isFromAnswer: false })
		},
		{
			icon: <Rows3 />,
			text: "下拉選單",
			type: "DROPDOWN",
			setDefaultQuestion: () => ({ type: "DROPDOWN", title: "", description: "", required: false, options: [{ label: "選項 1" }], isFromAnswer: false })
		},
		{
			icon: <LayoutList />,
			text: "詳細核取方塊",
			type: "DETAILED_MULTIPLE_CHOICE",
			setDefaultQuestion: () => ({
				type: "DETAILED_MULTIPLE_CHOICE",
				title: "",
				description: "",
				required: false,
				options: [],
				isFromAnswer: false,
				detailOptions: [{ label: "選項 1", description: "" }]
			})
		},
		{
			icon: <CloudUpload />,
			text: "檔案上傳",
			type: "UPLOAD_FILE",
			setDefaultQuestion: () => ({
				type: "UPLOAD_FILE",
				title: "",
				description: "",
				required: false,
				isFromAnswer: false,
				uploadAllowedFileTypes: ["PDF"],
				uploadMaxFileAmount: 1,
				uploadMaxFileSizeLimit: 10485760
			})
		},
		{
			icon: <Ellipsis />,
			text: "線性刻度",
			type: "LINEAR_SCALE",
			setDefaultQuestion: () => ({ type: "LINEAR_SCALE", title: "", description: "", required: false, isFromAnswer: false, start: 1, end: 5, startLabel: "", endLabel: "" })
		},
		{
			icon: <Star />,
			text: "評分",
			type: "RATING",
			setDefaultQuestion: () => ({ type: "RATING", title: "", description: "", required: false, isFromAnswer: false, start: 1, end: 5, startLabel: "", endLabel: "", icon: "star" })
		},
		{
			icon: <ListOrdered />,
			text: "排序",
			type: "RANKING",
			setDefaultQuestion: () => ({ type: "RANKING", title: "", description: "", required: false, options: [{ label: "選項 1" }, { label: "選項 2" }, { label: "選項 3" }], isFromAnswer: false })
		},
		{
			icon: <Calendar />,
			text: "日期選擇",
			type: "DATE",
			setDefaultQuestion: () => ({
				type: "DATE",
				title: "",
				description: "",
				required: false,
				isFromAnswer: false,
				dateHasYear: true,
				dateHasMonth: true,
				dateHasDay: true,
				dateHasMinDate: false,
				dateHasMaxDate: false,
				dateMinDate: "",
				dateMaxDate: ""
			})
		},
		{ icon: <Link2 />, text: "超連結", type: "HYPERLINK", setDefaultQuestion: () => ({ type: "HYPERLINK", title: "", description: "", required: false, url: "", isFromAnswer: false }) },
		{
			icon: <ShieldCheck />,
			text: "OAuth 驗證",
			type: "OAUTH_CONNECT",
			setDefaultQuestion: () => ({ type: "OAUTH_CONNECT", title: "", description: "", required: false, isFromAnswer: false, oauthProvider: "GITHUB" as const })
		}
	];

	const handleBack = () => {
		navigate(`/orgs/${orgSlug}/forms/${formid}/edit`);
	};

	const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);

	const handleAddQuestion = (setQuestion: () => Question) => {
		const newIndex = questions.length;
		const q = setQuestion();
		q.title = `問題${newIndex + 1}`;
		const updatedQuestions = [...questions, q];
		setQuestions(updatedQuestions);
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

		const otherOptionIndex = updatedQuestions[questionIndex].options!.findIndex(option => option.isOther);
		if (newOption.isOther) {
			if (otherOptionIndex === -1) {
				updatedQuestions[questionIndex].options!.push(newOption);
			}
		} else {
			if (otherOptionIndex !== -1) {
				updatedQuestions[questionIndex].options!.splice(otherOptionIndex, 0, newOption);
			} else {
				updatedQuestions[questionIndex].options!.push(newOption);
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
		updatedQuestions[questionIndex].detailOptions!.push(newDetailOption);
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
						{questions.map((question, index) => (
							<QuestionCard
								key={questionIds[index] ?? index}
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
						))}
					</div>
				</div>
				<div className={styles.sidebarContainer}>
					<div className={styles.sidebar}>
						<p>新增</p>
						{newQuestionOptions.map((option, index) => (
							<button key={index} className={styles.newQuestion} onClick={() => handleAddQuestion(option.setDefaultQuestion)}>
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
