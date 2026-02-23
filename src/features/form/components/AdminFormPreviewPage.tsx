import { useFormById } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import { resolveVisibleSectionsFromWorkflow } from "@/features/form/utils/workflow";
import { Button, Checkbox, DateInput, DetailedCheckbox, DragToOrder, ErrorMessage, Input, LoadingSpinner, Radio, ScaleInput, Select, TextArea } from "@/shared/components";
import type { FormsQuestionResponse, FormsSection } from "@nycu-sdc/core-system-sdk";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import styles from "./AdminFormPreviewPage.module.css";
import formStyles from "./FormDetailPage.module.css";

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

const isValidUrl = (url: string): boolean => {
	try {
		const u = new URL(url);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
};

export const AdminFormPreviewPage = () => {
	const { formid } = useParams<{ formid: string }>();
	const [currentStep, setCurrentStep] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

	const formQuery = useFormById(formid);
	const sectionsQuery = useSections(formid);
	const workflowQuery = useWorkflow(formid);
	const coverImageUrl = formid ? `/api/forms/${formid}/cover` : null;

	useEffect(() => {
		[formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]
			.filter((fontId): fontId is string => Boolean(fontId))
			.forEach(ensureEmfontStylesheet);
	}, [formQuery.data?.dressing?.headerFont, formQuery.data?.dressing?.questionFont, formQuery.data?.dressing?.textFont]);

	const sections: FormsSection[] = useMemo(() => {
		if (!sectionsQuery.data) return [];

		const baseSections: FormsSection[] = sectionsQuery.data.flatMap(item => {
			const list = Array.isArray(item.sections) ? item.sections : [];
			return list.map(section => ({
				id: section.id,
				formId: section.formId,
				title: section.title,
				description: section.description,
				questions: section.questions ?? []
			}));
		});

		const visible = resolveVisibleSectionsFromWorkflow(baseSections, workflowQuery.data?.workflow, answers);
		return [...visible, { id: "preview", formId: formid!, title: "填答結果預覽", questions: [] }];
	}, [sectionsQuery.data, workflowQuery.data, answers, formid]);

	const safeCurrentStep = sections.length > 0 ? Math.min(currentStep, sections.length - 1) : currentStep;
	const isFirstStep = safeCurrentStep === 0;
	const isLastStep = sections.length === 0 || safeCurrentStep === sections.length - 1;
	const isOnPreviewStep = isLastStep && sections[safeCurrentStep]?.id === "preview";

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: value }));
	};

	const updateOtherText = (questionId: string, value: string) => {
		setOtherTexts(prev => ({ ...prev, [questionId]: value }));
	};
	const getSelectedChoiceIds = (rawValue: string) => (rawValue ? rawValue.split(",").filter(Boolean) : []);

	const renderQuestion = (question: FormsQuestionResponse) => {
		const value = answers[question.id] || "";

		switch (question.type) {
			case "SHORT_TEXT":
				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Input id={question.id} placeholder="請輸入..." value={value} onChange={e => updateAnswer(question.id, e.target.value)} required={question.required} />
					</div>
				);

			case "LONG_TEXT":
				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<TextArea id={question.id} placeholder="請輸入..." value={value} onChange={e => updateAnswer(question.id, e.target.value)} rows={6} required={question.required} />
					</div>
				);

			case "SINGLE_CHOICE": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Radio
							options={choices.map(c => ({ value: c.id, label: c.name }))}
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
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<Select options={choices.map(c => ({ value: c.id, label: c.name }))} value={value || undefined} onValueChange={newValue => updateAnswer(question.id, newValue)} />
					</div>
				);
			}

			case "MULTIPLE_CHOICE": {
				const choices = question.choices ?? [];
				const otherChoice = choices.find(choice => choice.isOther);
				const selectedIds = getSelectedChoiceIds(value);
				const otherValue = otherTexts[question.id] || "";

				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<div className={formStyles.choiceList}>
							{choices.map(choice => (
								<Checkbox
									key={choice.id}
									id={`${question.id}-${choice.id}`}
									label={choice.name}
									checked={selectedIds.includes(choice.id)}
									onCheckedChange={checked => {
										const next = checked ? [...selectedIds, choice.id] : selectedIds.filter(v => v !== choice.id);
										updateAnswer(question.id, next.join(","));
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
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<div className={formStyles.choiceList}>
							{question.choices?.map(choice => (
								<DetailedCheckbox
									key={choice.id}
									id={`${question.id}-${choice.id}`}
									title={choice.name}
									description={choice.description || ""}
									checked={value.includes(choice.id)}
									onCheckedChange={checked => {
										const cur = value ? value.split(",") : [];
										const next = checked ? [...cur, choice.id] : cur.filter(v => v !== choice.id);
										updateAnswer(question.id, next.join(","));
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
						onChange={v => updateAnswer(question.id, v)}
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
						onChange={v => updateAnswer(question.id, v)}
					/>
				);

			case "RANKING":
				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
						<DragToOrder
							items={
								value
									? value.split(",").map(id => {
											const c = question.choices?.find(ch => ch.id === id);
											return { id, content: c?.name || id };
										})
									: question.choices?.map(c => ({ id: c.id, content: c.name })) || []
							}
							onReorder={items => updateAnswer(question.id, items.map(i => i.id).join(","))}
						/>
					</div>
				);

			case "HYPERLINK":
				return (
					<div key={question.id} className={formStyles.questionField}>
						<label className={formStyles.questionLabel}>
							{question.title}
							{question.required && <span className={formStyles.requiredAsterisk}> *</span>}
						</label>
						{question.description && <div className={formStyles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
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
					<div key={question.id} className={formStyles.questionField}>
						<p>不支援的問題類型: {question.type}</p>
						<p className={formStyles.caption}>{question.title}</p>
					</div>
				);
		}
	};

	if (formQuery.isLoading || sectionsQuery.isLoading || workflowQuery.isLoading) {
		return (
			<div className={styles.page}>
				<div className={styles.banner}>
					<span className={styles.bannerLabel}>預覽模式</span>
					<span className={styles.bannerDesc}>此為管理員預覽，表單尚未發布，填答內容不會被儲存</span>
				</div>
				<div className={`${formStyles.container} ${styles.previewContainer}`}>
					<LoadingSpinner />
				</div>
			</div>
		);
	}

	if (formQuery.isError || !formQuery.data) {
		return (
			<div className={styles.page}>
				<div className={styles.banner}>
					<span className={styles.bannerLabel}>預覽模式</span>
					<span className={styles.bannerDesc}>此為管理員預覽，表單尚未發布，填答內容不會被儲存</span>
				</div>
				<div className={`${formStyles.container} ${styles.previewContainer}`}>
					<ErrorMessage message={(formQuery.error as Error)?.message ?? "找不到表單"} />
				</div>
			</div>
		);
	}

	const form = formQuery.data;
	const primaryThemeColor = form.dressing?.color ?? "var(--orange)";
	const themedContainerStyle = {
		["--form-theme-color" as string]: primaryThemeColor,
		["--form-header-font" as string]: form.dressing?.headerFont || undefined,
		["--form-question-font" as string]: form.dressing?.questionFont || undefined,
		["--form-text-font" as string]: form.dressing?.textFont || undefined
	} as CSSProperties;

	return (
		<div className={styles.page}>
			{/* Fixed admin preview banner */}
			<div className={styles.banner}>
				<span className={styles.bannerLabel}>預覽模式</span>
				<span className={styles.bannerDesc}>此為管理員預覽，表單尚未發布，填答內容不會被儲存</span>
				<button type="button" className={styles.bannerClose} onClick={() => window.close()}>
					關閉預覽
				</button>
			</div>

			{/* Same visual layout as FormDetailPage */}
			<div className={styles.content}>
				{coverImageUrl && <img src={coverImageUrl} className={formStyles.cover} alt="表單封面" onError={e => (e.currentTarget.style.display = "none")} />}
				<div className={formStyles.container} style={themedContainerStyle}>
					<div className={formStyles.header}>
						<h1 className={formStyles.title}>{form.title}</h1>
						{safeCurrentStep === 0 ? <p className={formStyles.description}>{form.description}</p> : <h2 className={formStyles.sectionHeader}>{sections[safeCurrentStep]?.title}</h2>}
					</div>

					<div className={formStyles.structure}>
						<div className={formStyles.structureTitle}>
							<h2>表單結構</h2>
						</div>
						<div className={formStyles.workflow}>
							{sections.map((section, index) => (
								<button key={section.id} type="button" className={`${formStyles.workflowButton} ${index === safeCurrentStep ? formStyles.active : ""}`} onClick={() => setCurrentStep(index)}>
									{section.title}
								</button>
							))}
						</div>
					</div>

					<div className={formStyles.form}>
						{sections[safeCurrentStep] && (
							<div className={formStyles.section}>
								<div className={formStyles.fields}>
									{isOnPreviewStep ? (
										<div className={formStyles.previewSection}>
											{sections
												.filter(s => s.id !== "preview")
												.map(section => (
													<div key={section.id} className={formStyles.previewBlock}>
														<div className={formStyles.previewHeader}>
															<h3 className={formStyles.previewSectionTitle}>{section.title}</h3>
															<Button
																type="button"
																variant="secondary"
																onClick={() => {
																	const idx = sections.findIndex(s => s.id === section.id);
																	if (idx >= 0) setCurrentStep(idx);
																}}
															>
																修改
															</Button>
														</div>
														<ul className={formStyles.previewList}>
															{section.questions?.map((q, qi) => {
																const raw = answers[q.id] ?? "";
																const displayValue = raw
																	? q.choices
																		? raw
																				.split(",")
																				.map(id => q.choices?.find(c => c.id === id)?.name ?? id)
																				.join("、")
																		: raw
																	: "";
																return (
																	<li key={qi}>
																		<span className={formStyles.previewAnswerLabel}>
																			{q.title}
																			{q.required && <span className={formStyles.requiredAsterisk}> *</span>}
																		</span>
																		<span>：</span>
																		<span className={!displayValue && q.required ? formStyles.previewAnswerEmpty : ""}>{displayValue || "未填寫"}</span>
																	</li>
																);
															})}
														</ul>
													</div>
												))}
										</div>
									) : (
										<>
											{sections[safeCurrentStep].questions?.map(q => renderQuestion(q))}
											{(!sections[safeCurrentStep].questions || sections[safeCurrentStep].questions.length === 0) && <p className={formStyles.caption}>此區段目前沒有問題</p>}
										</>
									)}
								</div>
							</div>
						)}
						{sections.length === 0 && <p className={formStyles.caption}>此表單尚無任何區段</p>}

						<div className={formStyles.navigation}>
							<Button type="button" onClick={() => setCurrentStep(p => p - 1)} disabled={isFirstStep} themeColor="var(--foreground)">
								上一頁
							</Button>
							{isOnPreviewStep ? (
								<Button type="button" disabled themeColor={primaryThemeColor}>
									預覽
								</Button>
							) : (
								<Button type="button" onClick={() => setCurrentStep(p => p + 1)} themeColor={primaryThemeColor}>
									下一頁
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
