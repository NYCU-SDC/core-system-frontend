import { useFormResponse, useGetQuestionResponse, useSubmitFormResponse, useUpdateFormResponse } from "@/features/form/hooks/useFormResponses";
import { useFormQuery } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import * as formApi from "@/features/form/services/api";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { AccountButton, Button, Checkbox, DateInput, DetailedCheckbox, DragToOrder, FileUpload, Input, LoadingSpinner, Markdown, Radio, ScaleInput, TextArea, useToast } from "@/shared/components";
import type {
	FormsQuestionResponse,
	FormsSection,
	ResponsesAnswersRequestUpdate,
	ResponsesDateAnswer,
	ResponsesResponseProgress,
	ResponsesResponseSections,
	ResponsesScaleAnswer,
	ResponsesStringAnswer,
	ResponsesStringArrayAnswer
} from "@nycu-sdc/core-system-sdk";
import { Chrome, Github } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

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
	const answersInitialized = useRef(false);

	// ── React Query ──────────────────────────────────────────────────────────
	const formQuery = useFormQuery(formId);
	const meta = useSeo({
		rule: SEO_CONFIG.formDetail,
		params: { formId: formId ?? "" },
		data: formQuery.data
	});
	const sectionsQuery = useSections(formId, !!urlResponseId);
	const responseQuery = useFormResponse(formId, urlResponseId, !!urlResponseId);
	const updateResponseMutation = useUpdateFormResponse(urlResponseId ?? "");
	const submitResponseMutation = useSubmitFormResponse(formId ?? "");
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

	const sections: Section[] = useMemo(() => {
		if (!sectionsQuery.data) return [];
		const loaded: Section[] = sectionsQuery.data.flatMap(item => {
			const sections = Array.isArray(item.sections) ? item.sections : [];
			return sections.map(section => ({
				id: section.id,
				formId: section.formId,
				title: section.title,
				description: section.description,
				questions: section.questions
			}));
		});
		loaded.push({
			id: "preview",
			formId: formId!,
			title: "填答結果預覽",
			questions: []
		});
		return loaded;
	}, [sectionsQuery.data, formId]);

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
	const saveAnswers = useCallback(async () => {
		if (!urlResponseId) return;

		try {
			const questionTypeMap: Record<string, string> = {};
			sections.forEach(section => {
				section.questions?.forEach(question => {
					questionTypeMap[question.id] = question.type;
				});
			});

			const answersArray = Object.entries(answers)
				.filter(([, value]) => value !== "")
				.map(([questionId, value]) => {
					const questionType = questionTypeMap[questionId];

					// Determine answer type based on question type
					const stringArrayTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"];
					const dateTypes = ["DATE"];
					const scaleTypes = ["LINEAR_SCALE", "RATING"];

					if (dateTypes.includes(questionType)) {
						return {
							questionId,
							questionType: "DATE" as const,
							value: value
						} as ResponsesDateAnswer;
					} else if (scaleTypes.includes(questionType)) {
						return {
							questionId,
							questionType: questionType as ResponsesScaleAnswer["questionType"],
							value: parseInt(value, 10)
						} as ResponsesScaleAnswer;
					} else if (stringArrayTypes.includes(questionType)) {
						const valueArray = value.includes(",") ? value.split(",") : [value];
						const otherText = otherTexts[questionId]?.trim();
						return {
							questionId,
							questionType: questionType as ResponsesStringArrayAnswer["questionType"],
							value: valueArray,
							...(otherText ? { otherText } : {})
						} as ResponsesStringArrayAnswer;
					} else {
						return {
							questionId,
							questionType: questionType as ResponsesStringAnswer["questionType"],
							value: value
						} as ResponsesStringAnswer;
					}
				});

			if (answersArray.length === 0) return;

			const answersUpdate: ResponsesAnswersRequestUpdate = {
				answers: answersArray as (ResponsesStringAnswer | ResponsesStringArrayAnswer | ResponsesScaleAnswer | ResponsesDateAnswer)[]
			};

			await updateResponseMutation.mutateAsync(answersUpdate);
		} catch (error) {
			pushToast({ title: "自動儲存失敗", description: (error as Error).message, variant: "error" });
		}
	}, [urlResponseId, answers, otherTexts, sections, updateResponseMutation, pushToast]);

	useEffect(() => {
		if (!urlResponseId) return;

		const timer = setTimeout(() => {
			saveAnswers();
		}, 1000); // 1 秒後儲存

		return () => clearTimeout(timer);
	}, [answers, urlResponseId, saveAnswers]);

	// ── Loading / Error ──────────────────────────────────────────────────────
	const isLoading = formQuery.isLoading || sectionsQuery.isLoading;
	const error: string | null = formQuery.error ? (formQuery.error as Error).message : sectionsQuery.error ? (sectionsQuery.error as Error).message : null;

	const isLastStep = sections.length === 0 || currentStep === sections.length - 1;
	const isFirstStep = currentStep === 0;

	// Clamp currentStep to the valid range whenever sections data changes
	useEffect(() => {
		if (sections.length > 0 && currentStep >= sections.length) {
			setCurrentStep(sections.length - 1);
		}
	}, [sections.length, currentStep]);

	const handleNext = () => {
		if (!isLastStep) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleSectionClick = (index: number) => {
		setCurrentStep(index);
	};

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => ({
			...prev,
			[questionId]: value
		}));
	};

	const updateOtherText = (questionId: string, value: string) => {
		setOtherTexts(prev => ({
			...prev,
			[questionId]: value
		}));
	};
	const getSelectedChoiceIds = (rawValue: string) => (rawValue ? rawValue.split(",").filter(Boolean) : []);

	const renderQuestion = (question: FormsQuestionResponse) => {
		const value = answers[question.id] || "";

		switch (question.type) {
			case "SHORT_TEXT":
				return (
					<Input
						key={question.id}
						id={question.id}
						label={question.title}
						placeholder={question.description || "請輸入..."}
						value={value}
						onChange={e => updateAnswer(question.id, e.target.value)}
						required={question.required}
					/>
				);

			case "LONG_TEXT":
				return (
					<TextArea
						key={question.id}
						id={question.id}
						label={question.title}
						placeholder={question.description || "請輸入..."}
						value={value}
						onChange={e => updateAnswer(question.id, e.target.value)}
						rows={6}
						required={question.required}
					/>
				);

			case "SINGLE_CHOICE":
			case "DROPDOWN": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
						<Radio
							options={choices.map(choice => ({ value: choice.id, label: choice.name }))}
							value={value}
							onValueChange={newValue => {
								updateAnswer(question.id, newValue);
								if (newValue !== otherChoice?.id) {
									updateOtherText(question.id, "");
								}
							}}
						/>
						{otherChoice && value === otherChoice.id && (
							<Input placeholder="請填寫其他" value={otherValue} onChange={e => updateOtherText(question.id, e.target.value)} style={{ marginTop: "0.75rem" }} />
						)}
					</div>
				);
			}

			case "MULTIPLE_CHOICE": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const selectedIds = getSelectedChoiceIds(value);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <div dangerouslySetInnerHTML={{ __html: question.description }} />}
						<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							{choices.map(choice => (
								<Checkbox
									key={choice.id}
									id={`${question.id}-${choice.id}`}
									label={choice.name}
									checked={selectedIds.includes(choice.id)}
									onCheckedChange={checked => {
										const newValues = checked ? [...selectedIds, choice.id] : selectedIds.filter(v => v !== choice.id);
										updateAnswer(question.id, newValues.join(","));
										if (otherChoice?.id === choice.id && !checked) {
											updateOtherText(question.id, "");
										}
									}}
								/>
							))}
						</div>
						{otherChoice && selectedIds.includes(otherChoice.id) && (
							<Input placeholder="請填寫其他" value={otherValue} onChange={e => updateOtherText(question.id, e.target.value)} style={{ marginTop: "0.75rem" }} />
						)}
					</div>
				);
			}

			case "DETAILED_MULTIPLE_CHOICE":
				return (
					<div key={question.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
						{question.choices?.map(choice => (
							<DetailedCheckbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								title={choice.name}
								description={choice.description || ""}
								checked={value.includes(choice.id)}
								onCheckedChange={checked => {
									const currentValues = value ? value.split(",") : [];
									const newValues = checked ? [...currentValues, choice.id] : currentValues.filter(v => v !== choice.id);
									updateAnswer(question.id, newValues.join(","));
								}}
							/>
						))}
					</div>
				);

			case "DATE":
				return (
					<DateInput
						key={question.id}
						id={question.id}
						label={question.title}
						description={question.description || undefined}
						value={value}
						options={question.date || { hasYear: true, hasMonth: true, hasDay: true }}
						required={question.required}
						onChange={newValue => updateAnswer(question.id, newValue)}
					/>
				);

			case "LINEAR_SCALE":
			case "RATING":
				return (
					<ScaleInput
						key={question.id}
						id={question.id}
						label={question.title}
						description={question.description || undefined}
						value={value}
						options={question.scale || { minVal: 1, maxVal: 5 }}
						required={question.required}
						onChange={newValue => updateAnswer(question.id, newValue)}
					/>
				);

			case "RANKING":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
						<DragToOrder
							items={
								value
									? value.split(",").map(choiceId => {
											const choice = question.choices?.find(c => c.id === choiceId);
											return {
												id: choiceId,
												content: choice?.name || choiceId
											};
										})
									: question.choices?.map(choice => ({
											id: choice.id,
											content: choice.name
										})) || []
							}
							onReorder={items => {
								updateAnswer(question.id, items.map(item => item.id).join(","));
							}}
						/>
					</div>
				);

			case "UPLOAD_FILE":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
						<FileUpload
							id={question.id}
							label=""
							accept={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
							onChange={async file => {
								if (file && urlResponseId) {
									try {
										await formApi.uploadQuestionFiles(urlResponseId, question.id, [file]);
										updateAnswer(question.id, file.name);
									} catch (err) {
										pushToast({ title: "上傳失敗", description: (err as Error).message, variant: "error" });
									}
								}
							}}
						/>
						<p style={{ fontSize: "0.875rem", color: "var(--color-caption)", marginTop: "0.5rem" }}>
							最多 {question.uploadFile?.maxFileAmount || 1} 個檔案，每個檔案最大 {((question.uploadFile?.maxFileSizeLimit || 10485760) / 1024 / 1024).toFixed(0)} MB
						</p>
						{value && <p style={{ fontSize: "0.875rem", color: "var(--green)", marginTop: "0.25rem" }}>✓ 已上傳：{value}</p>}
					</div>
				);

			case "OAUTH_CONNECT": {
				// Track per-question whether a popup for this question is open
				const OAuthConnectQuestion = () => {
					const oauthAnswerQuery = useGetQuestionResponse(urlResponseId, question.id, !!value || false);

					// When window regains focus, refetch to see if OAuth completed
					useEffect(() => {
						const onFocus = () => oauthAnswerQuery.refetch();
						window.addEventListener("focus", onFocus);
						return () => window.removeEventListener("focus", onFocus);
					}, [oauthAnswerQuery]);

					// Sync server answer back into local state
					useEffect(() => {
						if (oauthAnswerQuery.data) {
							const payload = oauthAnswerQuery.data as unknown as Record<string, unknown>;
							const displayVal = String(payload.displayValue ?? payload.username ?? "connected");
							if (displayVal && displayVal !== value) {
								updateAnswer(question.id, displayVal);
							}
						}
					}, [oauthAnswerQuery.data]);

					const isConnected = !!value && value !== "";

					return (
						<div key={question.id}>
							<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
								{question.title}
								{question.required && <span style={{ color: "red" }}> *</span>}
							</label>
							{question.description && <Markdown content={question.description} />}
							<AccountButton
								onClick={() => {
									if (!urlResponseId) return;
									const provider = question.oauthConnect;
									const url = `/api/oauth/questions/${provider}?responseId=${urlResponseId}&questionId=${question.id}&r=${encodeURIComponent(window.location.href)}`;
									window.open(url, "_blank");
									// Mark as pending so the focus listener can pick it up
									updateAnswer(question.id, "__pending__");
								}}
								logo={question.oauthConnect === "GOOGLE" ? <Chrome size={18} /> : <Github size={18} />}
								style={isConnected && value !== "__pending__" ? { opacity: 0.85 } : undefined}
							>
								{isConnected && value !== "__pending__" ? `已連接 ${question.oauthConnect} 帳號` : `連接 ${question.oauthConnect} 帳號`}
							</AccountButton>
							{isConnected && value !== "__pending__" && <p style={{ fontSize: "0.875rem", color: "var(--green)", marginTop: "0.5rem" }}>✓ 已連接：{value}</p>}
							{value === "__pending__" && <p style={{ fontSize: "0.875rem", color: "var(--color-caption)", marginTop: "0.5rem" }}>等待驗證中…</p>}
						</div>
					);
				};
				return <OAuthConnectQuestion key={question.id} />;
			}

			case "HYPERLINK":
				return (
					<div key={question.id}>
						<Input
							id={question.id}
							label={question.title}
							placeholder={question.description || "https://"}
							value={value}
							onChange={e => updateAnswer(question.id, e.target.value)}
							required={question.required}
						/>
					</div>
				);

			default:
				return (
					<div key={question.id}>
						<p>不支援的問題類型: {question.type}</p>
						<p style={{ color: "var(--color-caption)" }}>{question.title}</p>
					</div>
				);
		}
	};

	const renderPreviewSection = () => {
		if (!previewData || previewData.length === 0) {
			return <p style={{ color: "var(--color-caption)" }}>尚無填答資料</p>;
		}

		return (
			<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				{previewData.map((section, sectionIndex: number) => (
					<div key={sectionIndex} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3 style={{ margin: 0 }}>{section.title}</h3>
							<button
								type="button"
								onClick={() => handleSectionClick(sectionIndex)}
								style={{ fontSize: "0.875rem", color: primaryThemeColor, background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem" }}
							>
								修改
							</button>
						</div>
						<ul style={{ listStyleType: "disc", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							{section.answerDetails?.map((detail, questionIndex: number) => {
								const isEmpty = !detail.payload?.displayValue;
								const isRequiredAndEmpty = isEmpty && detail.question.required;
								return (
									<li key={questionIndex}>
										<span style={{ fontWeight: 500 }}>
											{detail.question.title}
											{detail.question.required && <span style={{ color: "red" }}> *</span>}
										</span>
										<span>：</span>
										<span style={{ color: isRequiredAndEmpty ? "red" : undefined }}>{detail.payload?.displayValue || "未填寫"}</span>
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

		try {
			// Build answers payload (same logic as saveAnswers)
			const questionTypeMap: Record<string, string> = {};
			sections.forEach(section => {
				section.questions?.forEach(question => {
					questionTypeMap[question.id] = question.type;
				});
			});

			const answersArray = Object.entries(answers)
				.filter(([, value]) => value !== "")
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
					<pre style={{ whiteSpace: "pre-wrap", color: "red", marginBottom: "1rem" }}>{error || "找不到表單"}</pre>
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
					<h1 className={styles.title}>{form.title}</h1>
					{currentStep === 0 ? <p className={styles.description}>{form.description}</p> : <h2 className={styles.sectionHeader}>{sections[currentStep]?.title}</h2>}
				</div>

				<div className={styles.structure}>
					<div className={styles.structureTitle}>
						<h2>表單結構</h2>
						<p>（可點擊項目返回編輯）</p>
					</div>
					<div style={{ display: "flex", gap: "0.625rem" }}>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--color-caption)" }}></span>
							<p>完成填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--code-foreground)" }}></span>
							<p>待填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: primaryThemeColor }}></span>
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

				<form className={styles.form} onSubmit={handleSubmit}>
					{sections[currentStep] && (
						<div className={styles.section}>
							<div className={styles.fields}>
								{sections[currentStep].id === "preview" ? (
									responseQuery.isFetching ? (
										<div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
											<LoadingSpinner />
										</div>
									) : (
										renderPreviewSection()
									)
								) : (
									<>
										{sections[currentStep].questions?.map(question => renderQuestion(question))}
										{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p style={{ color: "var(--color-caption)" }}>此區段目前沒有問題</p>}
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
							<Button type="submit" disabled={responseProgress === "SUBMITTED"} processing={submitResponseMutation.isPending} themeColor={primaryThemeColor}>
								{responseProgress === "SUBMITTED" ? "已送出" : "送出"}
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
