import { useFormResponse, useSubmitFormResponse, useUpdateFormResponse } from "@/features/form/hooks/useFormResponses";
import { useFormQuery } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import * as formApi from "@/features/form/services/api";
import { resolveVisibleSectionsFromWorkflow } from "@/features/form/utils/workflow";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, LoadingSpinner, useToast } from "@/shared/components";
import {
	ResponsesResponseProgress,
	ResponsesSectionProgress,
	type FormsQuestionResponse,
	type FormsSection,
	type ResponsesAnswersRequestUpdate,
	type ResponsesDateAnswer,
	type ResponsesResponseSections,
	type ResponsesScaleAnswer,
	type ResponsesStringAnswer,
	type ResponsesStringArrayAnswer
} from "@nycu-sdc/core-system-sdk";
import { AlertCircle, Check, ChevronLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";
import { FormQuestionRenderer } from "./FormQuestionRenderer";

type Section = FormsSection;

interface FormResponseData {
	sections: ResponsesResponseSections[];
	progress: ResponsesResponseProgress;
}

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

export const FormDetailPage = () => {
	const { formId, responseId: urlResponseId } = useParams<{ formId: string; responseId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
	const [connectingOauthQuestionId, setConnectingOauthQuestionId] = useState<string | null>(null);
	const oauthPopupWatchTimerRef = useRef<number | null>(null);
	const answersInitialized = useRef(false);

	// ── React Query ──────────────────────────────────────────────────────────
	const formQuery = useFormQuery(formId);
	const meta = useSeo({
		rule: SEO_CONFIG.formDetail,
		params: { formId: formId ?? "" },
		data: formQuery.data
	});
	const sectionsQuery = useSections(formId, !!urlResponseId);
	const workflowQuery = useWorkflow(formId, !!urlResponseId);
	const responseQuery = useFormResponse(formId, urlResponseId, !!urlResponseId);
	const updateResponseMutation = useUpdateFormResponse(urlResponseId ?? "");
	const submitResponseMutation = useSubmitFormResponse(formId ?? "");
	const updateResponseMutateAsyncRef = useRef(updateResponseMutation.mutateAsync);
	const lastAutoSavePayloadRef = useRef<string>("");
	const lastFailedAutoSavePayloadRef = useRef<string>("");
	const coverImageUrl = formId ? `/api/forms/${formId}/cover` : null;

	// ── Derived state ────────────────────────────────────────────────────────
	const form = formQuery.data ?? null;
	const primaryThemeColor = form?.dressing?.color ?? "var(--orange)";

	const responseProgress: ResponsesResponseProgress = useMemo(() => {
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		return data?.progress ?? "DRAFT";
	}, [responseQuery.data]);

	useEffect(() => {
		[formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]
			.filter((fontId): fontId is string => Boolean(fontId))
			.forEach(ensureEmfontStylesheet);
	}, [formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]);

	useEffect(() => {
		updateResponseMutateAsyncRef.current = updateResponseMutation.mutateAsync;
	}, [updateResponseMutation.mutateAsync]);

	const sections: Section[] = useMemo(() => {
		if (!sectionsQuery.data) return [];
		const loaded: Section[] = sectionsQuery.data.flatMap(item => {
			const sections = Array.isArray(item.sections) ? item.sections : [];
			return sections.map(section => ({
				id: section.id,
				formId: section.formId,
				title: section.title,
				description: section.description,
				questions: section.questions ?? []
			}));
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

	// Sync pre-filled answers from the existing response (once on first load)
	useEffect(() => {
		if (answersInitialized.current) return;
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		if (!data?.sections) return;
		const loaded: Record<string, string> = {};
		const loadedOtherTexts: Record<string, string> = {};
		data.sections.forEach(section => {
			section.answerDetails?.forEach(detail => {
				if (!detail.question.id) return;
				const answerPayload = detail.payload?.answer;
				if (answerPayload && Array.isArray((answerPayload as ResponsesStringArrayAnswer).value)) {
					const arrayAnswer = answerPayload as ResponsesStringArrayAnswer;
					loaded[detail.question.id] = arrayAnswer.value.join(",");
					if (arrayAnswer.otherText) {
						loadedOtherTexts[detail.question.id] = arrayAnswer.otherText;
					}
					return;
				}
				if (detail.payload?.displayValue) {
					loaded[detail.question.id] = detail.payload.displayValue;
				}
			});
		});
		setAnswers(loaded);
		setOtherTexts(loadedOtherTexts);
		answersInitialized.current = true;
	}, [responseQuery.data]);

	// Refresh response data when navigating to the preview step
	const isOnPreviewStep = sections.length > 0 && currentStep === sections.length - 1 && sections[currentStep]?.id === "preview";

	useEffect(() => {
		if (isOnPreviewStep && urlResponseId) {
			responseQuery.refetch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOnPreviewStep]);

	const previewData: ResponsesResponseSections[] | null = useMemo(() => {
		if (!isOnPreviewStep) return null;
		const data = responseQuery.data as unknown as FormResponseData | undefined;
		return data?.sections ?? null;
	}, [isOnPreviewStep, responseQuery.data]);

	// ── Auto-save (debounced 1 s) ────────────────────────────────────────────
	const autoSavePayload = useMemo(() => {
		const questionTypeMap: Record<string, string> = {};
		sections.forEach(section => {
			section.questions?.forEach(question => {
				questionTypeMap[question.id] = question.type;
			});
		});

		const answersArray = Object.entries(answers)
			.filter(([questionId]) => sections.some(section => section.questions?.some(q => q.id === questionId)))
			.filter(([questionId, value]) => value !== "" && !["UPLOAD_FILE", "OAUTH_CONNECT"].includes(questionTypeMap[questionId]))
			.map(([questionId, value]) => {
				const questionType = questionTypeMap[questionId];
				const stringArrayTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"];
				const dateTypes = ["DATE"];
				const scaleTypes = ["LINEAR_SCALE", "RATING"];

				if (dateTypes.includes(questionType)) {
					return { questionId, questionType: "DATE" as const, value } as ResponsesDateAnswer;
				}
				if (scaleTypes.includes(questionType)) {
					return { questionId, questionType: questionType as ResponsesScaleAnswer["questionType"], value: parseInt(value, 10) } as ResponsesScaleAnswer;
				}
				if (stringArrayTypes.includes(questionType)) {
					const valueArray = value.includes(",") ? value.split(",") : [value];
					const otherText = otherTexts[questionId]?.trim();
					return { questionId, questionType: questionType as ResponsesStringArrayAnswer["questionType"], value: valueArray, ...(otherText ? { otherText } : {}) } as ResponsesStringArrayAnswer;
				}
				return { questionId, questionType: questionType as ResponsesStringAnswer["questionType"], value } as ResponsesStringAnswer;
			});

		if (answersArray.length === 0) return null;
		return {
			answers: answersArray as (ResponsesStringAnswer | ResponsesStringArrayAnswer | ResponsesScaleAnswer | ResponsesDateAnswer)[]
		} satisfies ResponsesAnswersRequestUpdate;
	}, [answers, otherTexts, sections]);

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

	// ── Loading / Error ──────────────────────────────────────────────────────
	const isLoading = formQuery.isLoading || sectionsQuery.isLoading || workflowQuery.isLoading;
	const error: string | null = formQuery.error
		? (formQuery.error as Error).message
		: sectionsQuery.error
			? (sectionsQuery.error as Error).message
			: workflowQuery.error
				? (workflowQuery.error as Error).message
				: null;

	const isLastStep = sections.length === 0 || currentStep === sections.length - 1;
	const isFirstStep = currentStep === 0;
	const currentSection = sections[currentStep];

	// Clamp currentStep to the valid range whenever sections data changes
	useEffect(() => {
		if (sections.length > 0 && currentStep >= sections.length) {
			setCurrentStep(sections.length - 1);
		}
	}, [sections.length, currentStep]);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleNext = () => {
		if (!isLastStep) {
			setCurrentStep(prev => prev + 1);
			scrollToTop();
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStep(prev => prev - 1);
			scrollToTop();
		}
	};

	const handleSectionClick = (index: number) => {
		setCurrentStep(index);
		scrollToTop();
	};

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => {
			const next = { ...prev, [questionId]: value };

			// Sync ranking questions whose source is the changed question
			const allQuestions = sections.flatMap(s => s.questions ?? []);
			const questionMap = new Map(allQuestions.map(q => [q.id, q]));
			allQuestions.forEach(q => {
				if (q.type !== "RANKING" || q.sourceId !== questionId) return;
				const rankingRaw = prev[q.id] ?? "";
				if (!rankingRaw) return;
				if (!value) {
					next[q.id] = "";
					return;
				}
				const sourceQuestion = questionMap.get(q.sourceId);
				const sourceSelectedIds = sourceQuestion?.type === "SINGLE_CHOICE" || sourceQuestion?.type === "DROPDOWN" ? [value] : value.split(",").filter(Boolean);
				const filteredRankingIds = rankingRaw
					.split(",")
					.filter(Boolean)
					.filter(id => sourceSelectedIds.includes(id));
				const missingIds = sourceSelectedIds.filter(id => !filteredRankingIds.includes(id));
				const normalized = [...filteredRankingIds, ...missingIds].join(",");
				if (normalized !== rankingRaw) next[q.id] = normalized;
			});

			return next;
		});
	};

	const updateOtherText = (questionId: string, value: string) => {
		setOtherTexts(prev => ({
			...prev,
			[questionId]: value
		}));
	};

	const handleOauthConnect = (question: FormsQuestionResponse) => {
		if (!urlResponseId) {
			pushToast({ title: "尚未建立填答", description: "請稍後再試一次", variant: "error" });
			return;
		}

		const callbackUrl = new URL("/forms/oauth-callback", window.location.origin);
		callbackUrl.searchParams.set("questionId", question.id);
		callbackUrl.searchParams.set("responseId", urlResponseId);

		const connectUrl = formApi.getConnectOauthAccountUrl(urlResponseId, question.id, callbackUrl.toString());
		const popup = window.open(connectUrl, "form-oauth-connect", "popup=yes,width=520,height=760");

		if (!popup) {
			pushToast({ title: "無法開啟綁定視窗", description: "請確認瀏覽器未封鎖彈出視窗", variant: "error" });
			return;
		}

		setConnectingOauthQuestionId(question.id);
		if (oauthPopupWatchTimerRef.current) {
			window.clearInterval(oauthPopupWatchTimerRef.current);
		}
		oauthPopupWatchTimerRef.current = window.setInterval(() => {
			if (popup.closed) {
				setConnectingOauthQuestionId(prev => (prev === question.id ? null : prev));
				if (oauthPopupWatchTimerRef.current) {
					window.clearInterval(oauthPopupWatchTimerRef.current);
					oauthPopupWatchTimerRef.current = null;
				}
			}
		}, 500);
		popup.focus();
	};

	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			if (event.origin !== window.location.origin) return;

			const payload = event.data as {
				type?: string;
				questionId?: string;
				responseId?: string;
				params?: Record<string, string>;
			};

			if (payload?.type !== "FORM_OAUTH_CONNECTED" || !payload.questionId) return;
			if (payload.responseId !== urlResponseId) return;
			if (oauthPopupWatchTimerRef.current) {
				window.clearInterval(oauthPopupWatchTimerRef.current);
				oauthPopupWatchTimerRef.current = null;
			}

			setConnectingOauthQuestionId(prev => (prev === payload.questionId ? null : prev));

			if (payload.params?.error) {
				pushToast({ title: "綁定失敗", description: payload.params.error, variant: "error" });
				return;
			}

			try {
				const questionResponse = await formApi.getQuestionResponse(urlResponseId!, payload.questionId);
				const answerPayload = questionResponse.answer;
				const answerValue = answerPayload.answer as { value?: { username?: string } };
				const oauthUsername = answerValue?.value?.username ?? "";
				const displayValue = answerPayload.displayValue ?? "";
				const finalValue = oauthUsername || displayValue;

				if (finalValue) {
					setAnswers(prev => ({
						...prev,
						[payload.questionId!]: finalValue
					}));
					pushToast({ title: "綁定成功", description: `已綁定帳號：${finalValue}`, variant: "success" });
				} else {
					pushToast({ title: "綁定完成", description: "已完成授權，但尚未取得帳號資訊", variant: "warning" });
				}
			} catch (error) {
				pushToast({ title: "讀取綁定結果失敗", description: (error as Error).message, variant: "error" });
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			if (oauthPopupWatchTimerRef.current) {
				window.clearInterval(oauthPopupWatchTimerRef.current);
				oauthPopupWatchTimerRef.current = null;
			}
			window.removeEventListener("message", handleMessage);
		};
	}, [urlResponseId, pushToast]);

	const renderPreviewSection = () => {
		if (!previewData || previewData.length === 0) {
			return <p className={styles.caption}>尚無填答資料</p>;
		}

		return (
			<div className={styles.previewSection}>
				{previewData
					.filter(section => section.progress !== ResponsesSectionProgress.SKIPPED)
					.map(section => (
						<div key={section.id} className={styles.previewBlock}>
							<div className={styles.previewHeader}>
								<h3 className={styles.previewSectionTitle}>{section.title}</h3>
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										const targetIndex = sections.findIndex(s => s.id === section.id);
										if (targetIndex >= 0) handleSectionClick(targetIndex);
									}}
								>
									修改
								</Button>
							</div>
							<ul className={styles.previewList}>
								{section.answerDetails?.map((detail, questionIndex: number) => {
									const isEmpty = !detail.payload?.displayValue;
									const isRequiredAndEmpty = isEmpty && detail.question.required;
									return (
										<li key={questionIndex}>
											<span className={styles.previewAnswerLabel}>
												{detail.question.title}
												{detail.question.required && <span className={styles.requiredAsterisk}> *</span>}
											</span>
											<span>：</span>
											<span className={isRequiredAndEmpty ? styles.previewAnswerEmpty : ""}>{detail.payload?.displayValue || "未填寫"}</span>
										</li>
									);
								}) || []}
							</ul>
						</div>
					))}
			</div>
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!urlResponseId) return;

		// Validate required fields across all non-preview sections
		const realSections = sections.filter(s => s.id !== "preview");
		for (let i = 0; i < realSections.length; i++) {
			const section = realSections[i];
			const missingQuestion = section.questions?.find(q => {
				if (!q.required) return false;
				const value = answers[q.id] ?? "";
				return value.trim() === "";
			});
			if (missingQuestion) {
				const sectionIndex = sections.findIndex(s => s.id === section.id);
				if (sectionIndex >= 0) {
					setCurrentStep(sectionIndex);
					scrollToTop();
				}
				pushToast({ title: "尚有必填欄位未填寫", description: `「${missingQuestion.title}」為必填`, variant: "error" });
				return;
			}
		}

		try {
			// Build answers payload (same logic as saveAnswers)
			const questionTypeMap: Record<string, string> = {};
			sections.forEach(section => {
				section.questions?.forEach(question => {
					questionTypeMap[question.id] = question.type;
				});
			});

			const answersArray = Object.entries(answers)
				.filter(([questionId]) => sections.some(section => section.questions?.some(q => q.id === questionId)))
				.filter(([questionId, value]) => value !== "" && !["UPLOAD_FILE", "OAUTH_CONNECT"].includes(questionTypeMap[questionId]))
				.map(([questionId, value]) => {
					const questionType = questionTypeMap[questionId];
					const stringArrayTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"];
					const dateTypes = ["DATE"];
					const scaleTypes = ["LINEAR_SCALE", "RATING"];

					if (dateTypes.includes(questionType)) {
						return { questionId, questionType: "DATE" as const, value } as ResponsesDateAnswer;
					} else if (scaleTypes.includes(questionType)) {
						return { questionId, questionType: questionType as ResponsesScaleAnswer["questionType"], value: parseInt(value, 10) } as ResponsesScaleAnswer;
					} else if (stringArrayTypes.includes(questionType)) {
						const valueArray = value.includes(",") ? value.split(",") : [value];
						const otherText = otherTexts[questionId]?.trim();
						return { questionId, questionType: questionType as ResponsesStringArrayAnswer["questionType"], value: valueArray, ...(otherText ? { otherText } : {}) } as ResponsesStringArrayAnswer;
					} else {
						return { questionId, questionType: questionType as ResponsesStringAnswer["questionType"], value } as ResponsesStringAnswer;
					}
				});

			submitResponseMutation.mutate(
				{
					responseId: urlResponseId,
					answers: { answers: answersArray as (ResponsesStringAnswer | ResponsesStringArrayAnswer | ResponsesScaleAnswer | ResponsesDateAnswer)[] }
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

	const themedContainerStyle = {
		["--form-theme-color" as string]: primaryThemeColor,
		["--form-header-font" as string]: form?.dressing?.headerFont || undefined,
		["--form-question-font" as string]: form?.dressing?.questionFont || undefined,
		["--form-text-font" as string]: form?.dressing?.textFont || undefined
	} as CSSProperties;

	return (
		<>
			{meta}
			{coverImageUrl && <img src={coverImageUrl} className={styles.cover} alt="表單封面" onError={e => (e.currentTarget.style.display = "none")} />}
			<div className={styles.container} style={themedContainerStyle}>
				<div className={styles.header}>
					<div className={styles.topBar}>
						<Button type="button" onClick={() => navigate("/forms")} themeColor="var(--foreground)">
							<ChevronLeft size={16} />
							返回表單列表
						</Button>
						{urlResponseId && (
							<div className={styles.saveStatus} aria-live="polite">
								{updateResponseMutation.isPending ? (
									<>
										<LoaderCircle size={16} className={styles.spinningIcon} />
										<span>儲存中</span>
									</>
								) : updateResponseMutation.isError ? (
									<>
										<AlertCircle size={16} />
										<span>有問題</span>
									</>
								) : (
									<>
										<Check size={16} />
										<span>已儲存</span>
									</>
								)}
							</div>
						)}
					</div>
					<h1 className={styles.title}>{form.title}</h1>
					{currentStep === 0 && form.description && <p className={styles.description}>{form.description}</p>}
					<h2 className={styles.sectionHeader}>{currentSection.title}</h2>
					{currentSection.description && <div className={styles.sectionDescription} dangerouslySetInnerHTML={{ __html: currentSection.description }} />}
				</div>

				<div className={styles.structure}>
					<div className={styles.structureTitle}>
						<h2>表單結構</h2>
						<p>（可點擊項目返回編輯）</p>
					</div>
					<div className={styles.structureLegendRow}>
						<div className={styles.structureLegend}>
							<span className={styles.structureLegendDotCompleted}></span>
							<p>完成填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span className={styles.structureLegendDotPending}></span>
							<p>待填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span className={styles.structureLegendDotCurrent}></span>
							<p>目前位置</p>
						</div>
					</div>
					<div className={styles.workflow}>
						{sections.map((section, index) => (
							<button key={section.id} type="button" className={`${styles.workflowButton} ${index === currentStep ? styles.active : ""}`} onClick={() => handleSectionClick(index)}>
								{section.title}
							</button>
						))}
					</div>
				</div>

				<form className={styles.form}>
					{sections[currentStep] && (
						<div className={styles.section}>
							<div className={styles.fields}>
								{sections[currentStep].id === "preview" ? (
									responseQuery.isFetching ? (
										<div className={styles.loadingCenter}>
											<LoadingSpinner />
										</div>
									) : (
										renderPreviewSection()
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
												connectingOauthQuestionId={connectingOauthQuestionId}
												onAnswerChange={updateAnswer}
												onOtherTextChange={updateOtherText}
												onOauthConnect={handleOauthConnect}
											/>
										))}
										{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p className={styles.caption}>此區段目前沒有問題</p>}
									</>
								)}
							</div>
						</div>
					)}

					<div className={styles.navigation}>
						<Button type="button" onClick={handlePrevious} disabled={isFirstStep} themeColor="var(--foreground)">
							上一頁
						</Button>
						{isLastStep ? (
							<Button type="button" onClick={handleSubmit} disabled={responseProgress === "SUBMITTED"} processing={submitResponseMutation.isPending} themeColor={primaryThemeColor}>
								{responseProgress === "SUBMITTED" ? "已儲存編輯" : "送出"}
							</Button>
						) : (
							<Button type="button" onClick={handleNext} themeColor={primaryThemeColor}>
								下一頁
							</Button>
						)}
					</div>
				</form>
			</div>
		</>
	);
};
