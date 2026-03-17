import { useFormById } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import { resolveVisibleSectionsFromWorkflow } from "@/features/form/utils/workflow";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, ErrorMessage, LoadingSpinner } from "@/shared/components";
import type { FormsSection } from "@nycu-sdc/core-system-sdk";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import styles from "./AdminFormPreviewPage.module.css";
import { FormHeader } from "./FormDetail/components/FormHeader/FormHeader";
import { FormPreviewSection } from "./FormDetail/components/FormPreviewSection/FormPreviewSection";
import { FormStructure } from "./FormDetail/components/FormStructure/FormStructure";
import formStyles from "./FormFilloutPage.module.css";
import { FormQuestionRenderer } from "./FormQuestionRenderer";

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
	const meta = useSeo({ rule: SEO_CONFIG.adminFormPreview, data: formQuery.data });

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
	const questionsById = useMemo(() => {
		return new Map(sections.flatMap(section => section.questions ?? []).map(question => [question.id, question]));
	}, [sections]);

	const safeCurrentStep = sections.length > 0 ? Math.min(currentStep, sections.length - 1) : currentStep;
	const currentSection = sections[safeCurrentStep];
	const isFirstStep = safeCurrentStep === 0;
	const isLastStep = sections.length === 0 || safeCurrentStep === sections.length - 1;
	const isOnPreviewStep = isLastStep && sections[safeCurrentStep]?.id === "preview";
	const goToStep = (step: number | ((prev: number) => number)) => {
		setCurrentStep(step);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: value }));
	};

	const updateOtherText = (questionId: string, value: string) => {
		setOtherTexts(prev => ({ ...prev, [questionId]: value }));
	};

	if (formQuery.isLoading || sectionsQuery.isLoading || workflowQuery.isLoading) {
		return (
			<div className={styles.page}>
				{meta}
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
				{meta}
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
			{meta}
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
					<FormHeader title={form.title} formDescription={form.description} currentStep={safeCurrentStep} currentSection={currentSection} />

					<FormStructure sections={sections} currentStep={safeCurrentStep} onSectionClick={goToStep} />

					<div className={formStyles.form}>
						{sections[safeCurrentStep] && (
							<div className={formStyles.section}>
								<div className={formStyles.fields}>
									{isOnPreviewStep ? (
										<FormPreviewSection mode="local" localSections={sections} localAnswers={answers} sections={sections} onSectionClick={goToStep} />
									) : (
										<>
											{sections[safeCurrentStep].questions?.map(question => (
												<FormQuestionRenderer
													key={question.id}
													question={question}
													value={answers[question.id] || ""}
													otherTextValue={otherTexts[question.id] || ""}
													sourceQuestion={question.sourceId ? questionsById.get(question.sourceId) : undefined}
													sourceAnswerValue={question.sourceId ? answers[question.sourceId] || "" : ""}
													disableFileUpload
													onAnswerChange={updateAnswer}
													onOtherTextChange={updateOtherText}
												/>
											))}
											{(!sections[safeCurrentStep].questions || sections[safeCurrentStep].questions.length === 0) && <p className={formStyles.caption}>此區段目前沒有問題</p>}
										</>
									)}
								</div>
							</div>
						)}
						{sections.length === 0 && <p className={formStyles.caption}>此表單尚無任何區段</p>}

						<div className={formStyles.navigation}>
							<Button type="button" onClick={() => goToStep(p => p - 1)} disabled={isFirstStep} themeColor="var(--foreground)">
								上一頁
							</Button>
							{isOnPreviewStep ? (
								<Button type="button" disabled themeColor={primaryThemeColor}>
									預覽
								</Button>
							) : (
								<Button type="button" onClick={() => goToStep(p => p + 1)} themeColor={primaryThemeColor}>
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
