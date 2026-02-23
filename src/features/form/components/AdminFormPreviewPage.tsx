import { useFormById } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, Checkbox, DateInput, DetailedCheckbox, DragToOrder, ErrorMessage, Input, LoadingSpinner, Markdown, Radio, ScaleInput, TextArea } from "@/shared/components";
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

		// Build a flat map of all sections from the API
		const sectionMap = new Map<string, FormsSection>();
		for (const item of sectionsQuery.data) {
			const list = Array.isArray(item.sections) ? item.sections : [];
			for (const s of list) {
				sectionMap.set(s.id, { id: s.id, formId: s.formId, title: s.title, description: s.description, questions: s.questions ?? [] });
			}
		}

		// If workflow is available, walk the `next` chain to build ordered list
		const workflow = workflowQuery.data?.workflow;
		if (workflow && workflow.length > 0) {
			const nodeMap = new Map(workflow.map(n => [n.id, n]));
			const startNode = workflow.find(n => n.type === "START");
			const ordered: FormsSection[] = [];
			const visited = new Set<string>();

			// Walk the graph collecting SECTION nodes in traversal order
			const walk = (id: string | undefined) => {
				if (!id || visited.has(id)) return;
				visited.add(id);
				const node = nodeMap.get(id);
				if (!node) return;
				if (node.type === "SECTION") {
					const section = sectionMap.get(id);
					if (section) ordered.push(section);
				}
				// Follow all branches
				walk(node.next);
				walk(node.nextTrue);
				walk(node.nextFalse);
			};

			walk(startNode?.id);

			// Append any sections not reachable from workflow (orphans)
			for (const [id, section] of sectionMap) {
				if (!visited.has(id)) ordered.push(section);
			}

			// Defensive: if walk produced nothing but we have sections, fall back
			if (ordered.length === 0 && sectionMap.size > 0) {
				return [...sectionMap.values()];
			}

			return ordered;
		}

		// Fallback: API order
		return [...sectionMap.values()];
	}, [sectionsQuery.data, workflowQuery.data]);

	const safeCurrentStep = sections.length > 0 ? Math.min(currentStep, sections.length - 1) : currentStep;
	const isFirstStep = safeCurrentStep === 0;
	const isLastStep = sections.length === 0 || safeCurrentStep === sections.length - 1;

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
							options={choices.map(c => ({ value: c.id, label: c.name }))}
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
						{question.description && <Markdown content={question.description} />}
						<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
									const cur = value ? value.split(",") : [];
									const next = checked ? [...cur, choice.id] : cur.filter(v => v !== choice.id);
									updateAnswer(question.id, next.join(","));
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
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
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

	if (formQuery.isLoading || sectionsQuery.isLoading || workflowQuery.isLoading) {
		return (
			<div className={styles.page}>
				<div className={styles.banner}>
					<span className={styles.bannerLabel}>預覽模式</span>
					<span className={styles.bannerDesc}>此為管理員預覽，表單尚未發布，填答內容不會被儲存</span>
				</div>
				<div className={formStyles.container} style={{ marginTop: "3rem" }}>
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
				<div className={formStyles.container} style={{ marginTop: "3rem" }}>
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
									{sections[safeCurrentStep].questions?.map(q => renderQuestion(q))}
									{(!sections[safeCurrentStep].questions || sections[safeCurrentStep].questions.length === 0) && <p style={{ color: "var(--color-caption)" }}>此區段目前沒有問題</p>}
								</div>
							</div>
						)}
						{sections.length === 0 && <p style={{ color: "var(--color-caption)" }}>此表單尚無任何區段</p>}

						<div className={formStyles.navigation}>
							<Button type="button" onClick={() => setCurrentStep(p => p - 1)} disabled={isFirstStep} themeColor="var(--foreground)">
								上一頁
							</Button>
							<Button type="button" onClick={() => setCurrentStep(p => p + 1)} disabled={isLastStep} themeColor={primaryThemeColor}>
								下一頁
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
