import { useFormResponse, useSubmitFormResponse, useUpdateFormResponse } from "@/features/form/hooks/useFormResponses";
import { useFormQuery } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import * as formApi from "@/features/form/services/api";
import { resolveVisibleSectionsFromWorkflow } from "@/features/form/utils/workflow";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, Checkbox, DateInput, DetailedCheckbox, DragToOrder, Input, LoadingSpinner, Radio, ScaleInput, Select, TextArea, useToast } from "@/shared/components";
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
import { AlertCircle, Check, ChevronLeft, LoaderCircle, RefreshCw, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

type Section = FormsSection;

const isValidUrl = (url: string): boolean => {
	try {
		const u = new URL(url);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
};

// ── File upload per-question component ────────────────────────────────────

interface FileItem {
	id: string;
	file: File;
	status: "uploading" | "success" | "error";
	error?: string;
}

interface FileUploadQuestionProps {
	responseId: string;
	questionId: string;
	maxFileAmount: number;
	allowedFileTypes: string;
	onFilesChange: (fileNames: string) => void;
}

const FileUploadQuestion = ({ responseId, questionId, maxFileAmount, allowedFileTypes, onFilesChange }: FileUploadQuestionProps) => {
	const [items, setItems] = useState<FileItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const doUpload = async (item: FileItem) => {
		setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "uploading" as const, error: undefined } : i)));
		try {
			await formApi.uploadQuestionFiles(responseId, questionId, [item.file]);
			setItems(prev => {
				const next = prev.map(i => (i.id === item.id ? { ...i, status: "success" as const } : i));
				onFilesChange(
					next
						.filter(i => i.status === "success")
						.map(i => i.file.name)
						.join(",")
				);
				return next;
			});
		} catch (err) {
			setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "error" as const, error: (err as Error).message } : i)));
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newFiles = Array.from(e.target.files || []);
		const activeCount = items.filter(i => i.status !== "error").length;
		const canAdd = Math.max(0, maxFileAmount - activeCount);
		const toAdd: FileItem[] = newFiles.slice(0, canAdd).map(file => ({
			id: crypto.randomUUID(),
			file,
			status: "uploading" as const
		}));
		if (inputRef.current) inputRef.current.value = "";
		setItems(prev => [...prev, ...toAdd]);
		toAdd.forEach(doUpload);
	};

	const removeItem = (id: string) => {
		setItems(prev => {
			const next = prev.filter(i => i.id !== id);
			onFilesChange(
				next
					.filter(i => i.status === "success")
					.map(i => i.file.name)
					.join(",")
			);
			return next;
		});
	};

	const activeCount = items.filter(i => i.status !== "error").length;
	const canAddMore = activeCount < maxFileAmount;

	return (
		<div className={styles.fileUploadList}>
			{items.map(item => (
				<div key={item.id} className={`${styles.fileItem} ${item.status === "error" ? styles.fileItemError : item.status === "uploading" ? styles.fileItemUploading : ""}`}>
					<span className={styles.fileItemName}>{item.file.name}</span>
					{item.status === "uploading" && <span className={styles.fileItemHint}>上傳中…</span>}
					{item.status === "error" && <span className={styles.fileItemHint}>{item.error || "上傳失敗"}</span>}
					<div className={styles.fileItemActions}>
						{item.status === "error" && (
							<button type="button" className={styles.fileRetryBtn} onClick={() => doUpload(item)}>
								<RefreshCw size={12} />
								重新上傳
							</button>
						)}
						{item.status !== "uploading" && (
							<button type="button" className={styles.fileRemoveBtn} onClick={() => removeItem(item.id)} aria-label="移除">
								<X size={14} />
							</button>
						)}
					</div>
				</div>
			))}
			{canAddMore && (
				<label className={styles.fileAddZone}>
					<input ref={inputRef} type="file" multiple={maxFileAmount > 1} accept={allowedFileTypes} onChange={handleInputChange} className={styles.fileAddInput} />
					<Upload size={14} />
					<span>點擊上傳{maxFileAmount > 1 ? "（可多選）" : ""}</span>
				</label>
			)}
		</div>
	);
};

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
			.filter(([questionId, value]) => value !== "" && questionTypeMap[questionId] !== "UPLOAD_FILE")
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
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Input id={question.id} placeholder="請輸入..." value={value} onChange={e => updateAnswer(question.id, e.target.value)} required={question.required} />
					</div>
				);

			case "LONG_TEXT":
				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<TextArea id={question.id} placeholder="請輸入..." value={value} onChange={e => updateAnswer(question.id, e.target.value)} rows={6} required={question.required} />
					</div>
				);

			case "SINGLE_CHOICE": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
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
						{otherChoice && value === otherChoice.id && <Input placeholder="請填寫其他" value={otherValue} onChange={e => updateOtherText(question.id, e.target.value)} />}
					</div>
				);
			}

			case "DROPDOWN": {
				const choices = question.choices ?? [];

				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Select options={choices.map(choice => ({ value: choice.id, label: choice.name }))} value={value || undefined} onValueChange={newValue => updateAnswer(question.id, newValue)} />
					</div>
				);
			}

			case "MULTIPLE_CHOICE": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const selectedIds = getSelectedChoiceIds(value);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<div className={styles.choiceList}>
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
						{otherChoice && selectedIds.includes(otherChoice.id) && <Input placeholder="請填寫其他" value={otherValue} onChange={e => updateOtherText(question.id, e.target.value)} />}
					</div>
				);
			}

			case "DETAILED_MULTIPLE_CHOICE":
				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<div className={styles.choiceList}>
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
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
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
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<FileUploadQuestion
							responseId={urlResponseId || ""}
							questionId={question.id}
							maxFileAmount={question.uploadFile?.maxFileAmount || 1}
							allowedFileTypes={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
							onFilesChange={fileNames => updateAnswer(question.id, fileNames)}
						/>
						<p className={styles.uploadHint}>
							最多 {question.uploadFile?.maxFileAmount || 1} 個檔案，每個檔案最大 {((question.uploadFile?.maxFileSizeLimit || 10485760) / 1024 / 1024).toFixed(0)} MB
						</p>
					</div>
				);

			case "OAUTH_CONNECT":
				return null;

			case "HYPERLINK":
				return (
					<div key={question.id} className={styles.questionField}>
						<label className={styles.questionLabel}>
							{question.title}
							{question.required && <span className={styles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Input
							id={question.id}
							placeholder="https://"
							value={value}
							onChange={e => updateAnswer(question.id, e.target.value)}
							required={question.required}
							error={value && !isValidUrl(value) ? "請輸入有效的網址（需以 http:// 或 https:// 開頭）" : ""}
						/>
					</div>
				);

			default:
				return (
					<div key={question.id} className={styles.questionField}>
						<p>不支援的問題類型: {question.type}</p>
						<p className={styles.caption}>{question.title}</p>
					</div>
				);
		}
	};

	const renderPreviewSection = () => {
		if (!previewData || previewData.length === 0) {
			return <p className={styles.caption}>尚無填答資料</p>;
		}

		return (
			<div className={styles.previewSection}>
				{previewData.map(section => (
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
				if (q.type === "OAUTH_CONNECT") return false;
				const value = answers[q.id] ?? "";
				return value.trim() === "";
			});
			if (missingQuestion) {
				const sectionIndex = sections.findIndex(s => s.id === section.id);
				if (sectionIndex >= 0) setCurrentStep(sectionIndex);
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
				.filter(([questionId, value]) => value !== "" && questionTypeMap[questionId] !== "UPLOAD_FILE")
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
					{currentStep === 0 && form.description && <div className={styles.description} dangerouslySetInnerHTML={{ __html: form.description }} />}
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

				<form className={styles.form} onSubmit={handleSubmit}>
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
										{sections[currentStep].questions?.map(question => renderQuestion(question))}
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
