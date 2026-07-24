import { FILLOUT_UNDO_CONFIG, useFilloutUndo, type FilloutSnapshot, type IrreversibleKind } from "@/features/form/hooks/useFilloutUndo";
import { useFormResponse, useSubmitFormResponse, useUpdateFormResponse } from "@/features/form/hooks/useFormResponses";
import { useFormQuery } from "@/features/form/hooks/useOrgForms";
import { buildAnswersPayload, useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import { resolveVisibleSectionsFromWorkflow } from "@/features/form/utils/workflow";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, LoadingSpinner, useToast } from "@/shared/components";
import { ResponsesResponseProgress, type FormsSection, type ResponsesResponseSections, type ResponsesStringArrayAnswer } from "@nycu-sdc/core-system-sdk";
import { ChevronLeft, ChevronRight, Redo2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormHeader } from "./FormDetail/components/FormHeader/FormHeader";
import { FormPreviewSection } from "./FormDetail/components/FormPreviewSection/FormPreviewSection";
import { FormStructure } from "./FormDetail/components/FormStructure/FormStructure";
import styles from "./FormFilloutPage.module.css";
import { FormQuestionRenderer } from "./FormQuestionRenderer";
import { type ServerFileInfo } from "./QuestionRenderers";

type Section = FormsSection;

interface FormResponseData {
	sections: ResponsesResponseSections[];
	progress: ResponsesResponseProgress;
}

// Toast when an undo/redo lands on a no-op marker; names the step so the user knows what was skipped.
const NOOP_TOAST: Record<IrreversibleKind, { title: string; description: string }> = {
	upload: { title: "這一步無法還原", description: "此步是「檔案上傳」，不會被還原。再按一次可退到上一筆變更。" },
	oauth: { title: "這一步無法還原", description: "此步是「帳號綁定」，不會被還原。再按一次可退到上一筆變更。" },
	workflow: { title: "這一步無法還原", description: "此步是「答案連動（會影響顯示的區段）」，不會被還原。再按一次可退到上一筆變更。" }
};

const ensureEmfontStylesheet = (fontId: string) => {
	if (!fontId) return;
	const linkId = `emfont-${fontId}`;
	if (document.getElementById(linkId)) return;
	const link = document.createElement("link");
	link.id = linkId;
	link.rel = "stylesheet";
	link.href = `https://font.emtech.cc/css/${encodeURIComponent(fontId)}`;
	document.head.appendChild(link);
};

export const FormFilloutPage = () => {
	const { formId, responseId: urlResponseId } = useParams<{ formId: string; responseId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const formQuery = useFormQuery(formId);
	const meta = useSeo({
		rule: SEO_CONFIG.formDetail,
		params: { formId: formId ?? "" },
		data: formQuery.data
	});
	const sectionsQuery = useSections(formId, !!urlResponseId);
	const workflowQuery = useWorkflow(formId, !!urlResponseId);
	const disableKeyboardUndoRedo = Boolean(workflowQuery.data?.workflow?.some(node => node.type === "CONDITION" && node.conditionRule?.question));
	const responseQuery = useFormResponse(formId, urlResponseId, !!urlResponseId);
	const updateResponseMutation = useUpdateFormResponse(urlResponseId ?? "");
	const submitResponseMutation = useSubmitFormResponse(formId ?? "");

	// State
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [fileMetadata, setFileMetadata] = useState<Record<string, ServerFileInfo[]>>({});
	const {
		state: formState,
		setState: setFormState,
		replaceState,
		undo,
		redo,
		resetHistory,
		flushCheckpoint,
		canUndo,
		canRedo,
		onTextInputBlurCheckpoint,
		commitIrreversible
	} = useFilloutUndo(
		{
			answers: {},
			otherTexts: {}
		},
		{ historyLimit: FILLOUT_UNDO_CONFIG.historyLimit, disableKeyboardShortcuts: disableKeyboardUndoRedo }
	);
	const { answers, otherTexts } = formState;
	// Ref

	const answersInitialized = useRef(false);
	const lastAutoSavePayloadRef = useRef<string>("");
	const lastFailedAutoSavePayloadRef = useRef<string>("");
	// Snapshot identity we last toasted for, so each landing toasts once and re-renders don't re-toast.
	const lastNoopToastRef = useRef<FilloutSnapshot | null>(null);

	// ── React Query ──────────────────────────────────────────────────────────
	const updateResponseMutateAsyncRef = useRef(updateResponseMutation.mutateAsync);
	const coverImageUrl = formId ? `/api/forms/${formId}/cover` : null;

	// ── Derived state ────────────────────────────────────────────────────────
	const form = formQuery.data ?? null;
	const primaryThemeColor = form?.dressing?.color ?? "var(--orange)";

	// Colors and fonts from form dressing, applied as CSS variables for easy theming in child components
	const themedContainerStyle = {
		["--form-theme-color" as string]: primaryThemeColor,
		["--form-header-font" as string]: form?.dressing?.headerFont || undefined,
		["--form-question-font" as string]: form?.dressing?.questionFont || undefined,
		["--form-text-font" as string]: form?.dressing?.textFont || undefined
	} as CSSProperties;

	// ── Loading / Error ──────────────────────────────────────────────────────
	const isLoading = formQuery.isLoading || sectionsQuery.isLoading || workflowQuery.isLoading;
	const error: string | null = formQuery.error
		? (formQuery.error as Error).message
		: sectionsQuery.error
			? (sectionsQuery.error as Error).message
			: workflowQuery.error
				? (workflowQuery.error as Error).message
				: null;

	const responseProgress: ResponsesResponseProgress = useMemo(() => {
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		return data?.progress ?? "DRAFT";
	}, [responseQuery.data]);

	const sections: Section[] = useMemo(() => {
		if (!sectionsQuery.data) return [];
		const loaded: Section[] = sectionsQuery.data.map(item => {
			return {
				id: item.section.id,
				formId: item.section.formId,
				title: item.section.title,
				description: item.section.description,
				descriptionHtml: item.section.descriptionHtml,
				questions: item.questions ?? []
			};
		});
		const visible = resolveVisibleSectionsFromWorkflow(loaded, workflowQuery.data?.workflow, answers);
		const withPreview = [...visible];
		withPreview.push({
			id: "preview",
			formId: formId!,
			title: "填答結果預覽",
			questions: []
		});
		return withPreview;
	}, [sectionsQuery.data, workflowQuery.data, answers, formId]);

	const questionsById = useMemo(() => {
		return new Map(sections.flatMap(section => section.questions ?? []).map(question => [question.id, question]));
	}, [sections]);

	// Questions whose answer feeds a workflow CONDITION — changing one re-computes visible sections.
	const workflowTriggerQuestionIds = useMemo(() => {
		const ids = new Set<string>();
		workflowQuery.data?.workflow?.forEach(node => {
			if (node.type === "CONDITION" && node.conditionRule?.question) ids.add(node.conditionRule.question);
		});
		return ids;
	}, [workflowQuery.data]);

	// Whether the form is currently being filled out (as opposed to just previewing)
	const isOnPreviewStep = sections.length > 0 && currentStep === sections.length - 1 && sections[currentStep]?.id === "preview";
	const isLastStep = sections.length === 0 || currentStep === sections.length - 1;
	const isFirstStep = currentStep === 0;
	const currentSection = sections[currentStep];

	const previewData: ResponsesResponseSections[] | null = useMemo(() => {
		if (!isOnPreviewStep) return null;
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		return data?.sections ?? null;
	}, [isOnPreviewStep, responseQuery.data]);

	// ── Auto-save (debounced 1 s) ────────────────────────────────────────────
	const autoSavePayload = useMemo(() => {
		return buildAnswersPayload(sections, answers, otherTexts);
	}, [answers, otherTexts, sections]);

	// Effects
	useEffect(() => {
		[formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]
			.filter((fontId): fontId is string => Boolean(fontId))
			.forEach(ensureEmfontStylesheet);
	}, [formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]);

	useEffect(() => {
		updateResponseMutateAsyncRef.current = updateResponseMutation.mutateAsync;
	}, [updateResponseMutation.mutateAsync]);

	// Sync pre-filled answers from the existing response (once on first load)
	useEffect(() => {
		if (answersInitialized.current) return;
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		if (!data?.sections) return;
		const loadedFileMetadata: Record<string, ServerFileInfo[]> = {};
		const loadedAnswers: Record<string, string> = {};
		const loadedOtherTexts: Record<string, string> = {};
		data.sections.forEach(section => {
			section.answerDetails?.forEach(detail => {
				if (!detail.question.id) return;
				const answerPayload = detail.payload?.answer;
				if (detail.question.type === "UPLOAD_FILE") {
					const fileValue = answerPayload as { value?: { originalFilename?: string; fileId?: string; contentType?: string }[] } | undefined;
					const fileInfos: ServerFileInfo[] = (fileValue?.value ?? [])
						.filter(f => f.fileId && f.originalFilename)
						.map(f => ({ fileId: f.fileId!, originalFilename: f.originalFilename!, contentType: f.contentType ?? "application/octet-stream" }));
					loadedFileMetadata[detail.question.id] = fileInfos;
					if (fileInfos.length > 0) {
						loadedAnswers[detail.question.id] = fileInfos.map(f => f.originalFilename).join(",");
					}
					return;
				}
				if (answerPayload && Array.isArray((answerPayload as ResponsesStringArrayAnswer).value)) {
					const arrayAnswer = answerPayload as ResponsesStringArrayAnswer;
					loadedAnswers[detail.question.id] = arrayAnswer.value.join(",");
					if (arrayAnswer.otherText) {
						loadedOtherTexts[detail.question.id] = arrayAnswer.otherText;
					}
					return;
				}
				if (detail.payload?.displayValue) {
					loadedAnswers[detail.question.id] = detail.payload.displayValue;
				}
			});
		});
		replaceState({
			answers: loadedAnswers,
			otherTexts: loadedOtherTexts
		});
		setFileMetadata(loadedFileMetadata);
		answersInitialized.current = true;
	}, [replaceState, responseQuery.data]);

	useEffect(() => {
		if (isOnPreviewStep && urlResponseId) {
			responseQuery.refetch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOnPreviewStep]);

	useEffect(() => {
		if (!urlResponseId || !autoSavePayload) return;

		const payloadKey = JSON.stringify(autoSavePayload);
		if (payloadKey === lastAutoSavePayloadRef.current || payloadKey === lastFailedAutoSavePayloadRef.current) {
			return;
		}

		const timer = setTimeout(() => {
			lastAutoSavePayloadRef.current = payloadKey;
			updateResponseMutateAsyncRef
				.current(autoSavePayload)
				.then(() => {
					lastFailedAutoSavePayloadRef.current = "";
				})
				.catch(error => {
					lastFailedAutoSavePayloadRef.current = payloadKey;
					pushToast({ title: "自動儲存失敗", description: (error as Error).message, variant: "error" });
				});
		}, 1000);

		return () => clearTimeout(timer);
	}, [urlResponseId, autoSavePayload, pushToast]);

	// Clamp currentStep to the valid range whenever sections data changes
	useEffect(() => {
		if (sections.length > 0 && currentStep >= sections.length) {
			setCurrentStep(sections.length - 1);
		}
	}, [sections.length, currentStep]);

	// Toast when undo/redo lands on a no-op marker (the next press continues to the real change).
	useEffect(() => {
		if (!formState.noop) return;
		if (lastNoopToastRef.current === formState) return;
		lastNoopToastRef.current = formState;
		pushToast({ ...NOOP_TOAST[formState.noop.kind], variant: "info" });
	}, [formState, pushToast]);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const moveToStep = (nextStep: number) => {
		flushCheckpoint();
		resetHistory();
		setCurrentStep(nextStep);
		scrollToTop();
	};

	const handleUndo = () => {
		flushCheckpoint();
		undo();
	};

	const handleRedo = () => {
		flushCheckpoint();
		redo();
	};

	const handleNext = () => {
		if (!isLastStep) {
			moveToStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			moveToStep(currentStep - 1);
		}
	};

	const handleSectionClick = (index: number) => {
		moveToStep(index);
	};

	const isDebouncedTextQuestion = (questionId: string) => {
		const question = questionsById.get(questionId);
		return question?.type === "SHORT_TEXT" || question?.type === "LONG_TEXT" || question?.type === "HYPERLINK";
	};

	const irreversibleKindFor = (questionId: string): IrreversibleKind | null => {
		const question = questionsById.get(questionId);
		if (question?.type === "UPLOAD_FILE") return "upload";
		if (question?.type === "OAUTH_CONNECT") return "oauth";
		// Only discrete (non-text) workflow triggers — a free-text trigger would mark a no-op per keystroke.
		if (workflowTriggerQuestionIds.has(questionId) && !isDebouncedTextQuestion(questionId)) return "workflow";
		return null;
	};

	// Apply an answer change plus any dependent RANKING re-sync; pure so both code paths can reuse it.
	const applyAnswerUpdate = (prevState: FilloutSnapshot, questionId: string, value: string): FilloutSnapshot => {
		const nextAnswers = { ...prevState.answers, [questionId]: value };
		// Sync ranking questions whose source is the changed question
		const allQuestions = sections.flatMap(section => section.questions ?? []);
		const questionMap = new Map(allQuestions.map(question => [question.id, question]));
		allQuestions.forEach(question => {
			if (question.type !== "RANKING" || question.sourceId !== questionId) return;
			const rankingRaw = prevState.answers[question.id] ?? "";
			if (!rankingRaw) return;
			if (!value) {
				nextAnswers[question.id] = "";
				return;
			}
			const sourceQuestion = questionMap.get(question.sourceId);
			const sourceSelectedIds = sourceQuestion?.type === "SINGLE_CHOICE" || sourceQuestion?.type === "DROPDOWN" ? [value] : value.split(",").filter(Boolean);
			const filteredRankingIds = rankingRaw
				.split(",")
				.filter(Boolean)
				.filter(id => sourceSelectedIds.includes(id));
			const missingIds = sourceSelectedIds.filter(id => !sourceSelectedIds.includes(id));
			const normalized = [...filteredRankingIds, ...missingIds].join(",");
			if (normalized !== rankingRaw) nextAnswers[question.id] = normalized;
		});

		return {
			...prevState,
			answers: nextAnswers
		};
	};

	const updateAnswer = (questionId: string, value: string) => {
		const kind = irreversibleKindFor(questionId);
		// Only mark a no-op on a real value change — upload onAnswerChange fires spuriously (load / download).
		if (kind && answers[questionId] !== value) {
			commitIrreversible(kind, prevState => applyAnswerUpdate(prevState, questionId, value));
			return;
		}
		setFormState(prevState => applyAnswerUpdate(prevState, questionId, value), {
			checkpoint: isDebouncedTextQuestion(questionId) ? "debounced" : "immediate"
		});
	};

	const updateOtherText = (questionId: string, value: string) => {
		setFormState(
			prevState => ({
				...prevState,
				otherTexts: {
					...prevState.otherTexts,
					[questionId]: value
				}
			}),
			{ checkpoint: "debounced" }
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!urlResponseId) return;

		const NO_ANSWER_REQUIRED_TYPES: string[] = ["OAUTH_CONNECT", "UPLOAD_FILE"];
		// Validate required fields across all non-preview sections

		const realSections = sections.filter(section => section.id !== "preview");
		for (let i = 0; i < realSections.length; i++) {
			const section = realSections[i];
			const missingQuestion = section.questions?.find(question => {
				if (!question.required) return false;
				if (NO_ANSWER_REQUIRED_TYPES.includes(question.type)) return false;
				const value = answers[question.id] ?? "";
				return value.trim() === "";
			});
			if (missingQuestion) {
				const sectionIndex = sections.findIndex(sectionItem => sectionItem.id === section.id);
				if (sectionIndex >= 0) {
					moveToStep(sectionIndex);
				}
				pushToast({ title: "尚有必填欄位未填寫", description: `「${missingQuestion.title}」為必填`, variant: "error" });
				return;
			}
		}

		try {
			// Build answers payload
			const payload = buildAnswersPayload(sections, answers, otherTexts) ?? { answers: [] };

			submitResponseMutation.mutate(
				{
					responseId: urlResponseId,
					answers: payload
				},
				{
					onSuccess: () => setIsSubmitted(true),
					onError: err => {
						pushToast({ title: "提交失敗", description: (err as Error).message, variant: "error" });
					}
				}
			);
		} catch (err) {
			pushToast({ title: "提交失敗", description: (err as Error).message, variant: "error" });
		}
	};

	if (isSubmitted) {
		return (
			<>
				{meta}
				<div className={styles.successContainer}>
					<div className={styles.successBox}>
						<h1 className={styles.successTitle}>感謝您的填答！</h1>
						<p className={styles.successMessage}>{form?.messageAfterSubmission}</p>
						<div className={styles.successActions}>
							<Button type="button" onClick={() => urlResponseId && navigate(`/forms/${formId}?responseId=${urlResponseId}`)} themeColor="var(--code-foreground)">
								查看問卷副本
							</Button>
							<Button type="button" onClick={() => navigate("/forms")} themeColor={primaryThemeColor}>
								返回主頁
							</Button>
						</div>
					</div>
				</div>
			</>
		);
	}

	// 載入中
	if (isLoading) {
		return (
			<>
				{meta}
				<div className={styles.container}>
					<p>載入表單中...</p>
				</div>
			</>
		);
	}

	// 錯誤處理
	if (error || !form) {
		return (
			<>
				{meta}
				<div className={styles.container}>
					<h1 className={styles.title}>載入失敗</h1>
					<pre className={styles.errorPre}>{error || "找不到表單"}</pre>
					<Button onClick={() => navigate("/forms")} themeColor="var(--orange)">
						返回表單列表
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			{meta}
			{coverImageUrl && <img src={coverImageUrl} className={styles.cover} alt="表單封面" onError={e => (e.currentTarget.style.display = "none")} />}
			<div className={styles.container} style={themedContainerStyle}>
				<FormHeader
					title={form.title}
					formDescriptionHtml={form.descriptionHtml}
					currentStep={currentStep}
					currentSection={currentSection}
					onBack={() => navigate("/forms")}
					saveStatus={urlResponseId ? (updateResponseMutation.isPending ? "saving" : updateResponseMutation.isError ? "error" : "saved") : undefined}
				/>

				<FormStructure sections={sections} currentStep={currentStep} onSectionClick={handleSectionClick} />

				<form className={styles.form} onBlurCapture={onTextInputBlurCheckpoint}>
						{!isOnPreviewStep && (
							<div className={styles.undoBar}>
								<button type="button" className={styles.undoBarBtn} onClick={handleUndo} disabled={!canUndo} aria-label="復原" title={disableKeyboardUndoRedo ? "復原" : "復原　Ctrl + Z"}>
									<Undo2 size={18} />
								</button>
								<button type="button" className={styles.undoBarBtn} onClick={handleRedo} disabled={!canRedo} aria-label="重做" title={disableKeyboardUndoRedo ? "重做" : "重做　Ctrl + Shift + Z"}>
									<Redo2 size={18} />
								</button>
							</div>
						)}
					{sections[currentStep] && (
						<div className={styles.section}>
							<div className={styles.fields}>
								{sections[currentStep].id === "preview" ? (
									responseQuery.isFetching ? (
										<div className={styles.loadingCenter}>
											<LoadingSpinner />
										</div>
									) : (
										<FormPreviewSection mode="response" previewData={previewData} sections={sections} onSectionClick={handleSectionClick} />
									)
								) : (
									<>
										{sections[currentStep].questions?.map(question => (
											<FormQuestionRenderer
												key={question.id}
												question={question}
												value={answers[question.id] || ""}
												otherTextValue={otherTexts[question.id] || ""}
												sourceQuestion={question.sourceId ? questionsById.get(question.sourceId) : undefined}
												sourceAnswerValue={question.sourceId ? answers[question.sourceId] || "" : ""}
												responseId={urlResponseId}
												initialFiles={fileMetadata[question.id]}
												onFileMetadataChange={files => setFileMetadata(prev => ({ ...prev, [question.id]: files }))}
												onAnswerChange={updateAnswer}
												onOtherTextChange={updateOtherText}
											/>
										))}
										{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p className={styles.caption}>此區段目前沒有問題</p>}
									</>
								)}
							</div>
						</div>
					)}

					<div className={styles.navigation}>
						<div className={styles.navigationGroup}>
							<Button type="button" className={styles.navChevronBtn} onClick={handlePrevious} disabled={isFirstStep} themeColor="var(--foreground)" aria-label="上一頁" title="上一頁">
								<span className={styles.navLabel}>上一頁</span>
								<ChevronLeft className={styles.navIcon} size={20} />
							</Button>
						</div>
						<div className={styles.navigationGroup}>
							{isLastStep ? (
								<Button type="button" onClick={handleSubmit} disabled={responseProgress === "SUBMITTED"} processing={submitResponseMutation.isPending} themeColor={primaryThemeColor}>
									{responseProgress === "SUBMITTED" ? "已儲存編輯" : "送出"}
								</Button>
							) : (
								<Button type="button" className={styles.navChevronBtn} onClick={handleNext} themeColor={primaryThemeColor} aria-label="下一頁" title="下一頁">
									<span className={styles.navLabel}>下一頁</span>
									<ChevronRight className={styles.navIcon} size={20} />
								</Button>
							)}
						</div>
					</div>
				</form>
			</div>
		</>
	);
};
