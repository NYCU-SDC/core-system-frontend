import { useFormById } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { Button, Checkbox, DateInput, DetailedCheckbox, DragToOrder, ErrorMessage, Input, LoadingSpinner, Markdown, Radio, ScaleInput, TextArea } from "@/shared/components";
import type { FormsQuestionResponse, FormsSection } from "@nycu-sdc/core-system-sdk";
import { formsGetFormCoverImage } from "@nycu-sdc/core-system-sdk";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./AdminFormPreviewPage.module.css";
import formStyles from "./FormDetailPage.module.css";

export const AdminFormPreviewPage = () => {
	const { formid } = useParams<{ formid: string }>();
	const [currentStep, setCurrentStep] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	const formQuery = useFormById(formid);
	const sectionsQuery = useSections(formid);

	const coverQuery = useQuery({
		queryKey: ["form", formid, "cover"],
		queryFn: async () => {
			const res = await formsGetFormCoverImage(formid!, { credentials: "include" });
			if (res.status === 200 && res.data) {
				const blob = new Blob([res.data], { type: "image/webp" });
				return URL.createObjectURL(blob);
			}
			return null;
		},
		enabled: !!formid,
		staleTime: Infinity,
		gcTime: 0
	});

	useEffect(() => {
		const url = coverQuery.data;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	}, [coverQuery.data]);

	const sections: FormsSection[] = useMemo(() => {
		if (!sectionsQuery.data) return [];
		return sectionsQuery.data.flatMap(item =>
			Array.isArray(item.sections)
				? item.sections.map(s => ({
						id: s.id,
						formId: s.formId,
						title: s.title,
						description: s.description,
						questions: s.questions
					}))
				: []
		);
	}, [sectionsQuery.data]);

	// Clamp step if sections shrink
	useEffect(() => {
		if (sections.length > 0 && currentStep >= sections.length) {
			setCurrentStep(sections.length - 1);
		}
	}, [sections.length, currentStep]);

	const isFirstStep = currentStep === 0;
	const isLastStep = sections.length === 0 || currentStep === sections.length - 1;

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: value }));
	};

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
			case "DROPDOWN":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
						<Radio options={question.choices?.map(c => ({ value: c.id, label: c.name })) || []} value={value} onValueChange={v => updateAnswer(question.id, v)} />
					</div>
				);

			case "MULTIPLE_CHOICE":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <Markdown content={question.description} />}
						<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							{question.choices?.map(choice => (
								<Checkbox
									key={choice.id}
									id={`${question.id}-${choice.id}`}
									label={choice.name}
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
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{question.title}</label>
						{question.description && (
							<a href={question.description} target="_blank" rel="noopener noreferrer" style={{ color: "var(--orange)", textDecoration: "underline" }}>
								{question.description}
							</a>
						)}
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

	if (formQuery.isLoading || sectionsQuery.isLoading) {
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
				{coverQuery.data && <img src={coverQuery.data} className={formStyles.cover} alt="表單封面" />}
				<div className={formStyles.container}>
					<div className={formStyles.header}>
						<h1 className={formStyles.title}>{form.title}</h1>
						{currentStep === 0 ? <p className={formStyles.description}>{form.description}</p> : <h2 className={formStyles.sectionHeader}>{sections[currentStep]?.title}</h2>}
					</div>

					<div className={formStyles.structure}>
						<div className={formStyles.structureTitle}>
							<h2>表單結構</h2>
						</div>
						<div className={formStyles.workflow}>
							{sections.map((section, index) => (
								<button key={section.id} type="button" className={`${formStyles.workflowButton} ${index === currentStep ? formStyles.active : ""}`} onClick={() => setCurrentStep(index)}>
									{section.title}
								</button>
							))}
						</div>
					</div>

					<div className={formStyles.form}>
						{sections[currentStep] && (
							<div className={formStyles.section}>
								<div className={formStyles.fields}>
									{sections[currentStep].questions?.map(q => renderQuestion(q))}
									{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p style={{ color: "var(--color-caption)" }}>此區段目前沒有問題</p>}
								</div>
							</div>
						)}
						{sections.length === 0 && <p style={{ color: "var(--color-caption)" }}>此表單尚無任何區段</p>}

						<div className={formStyles.navigation}>
							<Button type="button" onClick={() => setCurrentStep(p => p - 1)} disabled={isFirstStep} themeColor="var(--foreground)">
								上一頁
							</Button>
							<Button type="button" onClick={() => setCurrentStep(p => p + 1)} disabled={isLastStep} themeColor="var(--orange)">
								下一頁
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
