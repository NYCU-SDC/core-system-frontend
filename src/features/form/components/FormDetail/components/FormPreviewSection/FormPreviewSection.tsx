import { Button } from "@/shared/components";
import { ResponsesSectionProgress, type FormsSection, type ResponsesResponseSections } from "@nycu-sdc/core-system-sdk";
import styles from "./FormPreviewSection.module.css";

type ResponseModeProps = {
	mode: "response";
	previewData: ResponsesResponseSections[] | null;
	sections: FormsSection[];
	onSectionClick: (index: number) => void;
};

type LocalModeProps = {
	mode: "local";
	localSections: FormsSection[];
	localAnswers: Record<string, string>;
	sections: FormsSection[];
	onSectionClick: (index: number) => void;
};

type FormPreviewSectionProps = ResponseModeProps | LocalModeProps;

export const FormPreviewSection = (props: FormPreviewSectionProps) => {
	const { sections, onSectionClick } = props;

	if (props.mode === "local") {
		const displaySections = props.localSections.filter(s => s.id !== "preview");
		return (
			<div className={styles.previewSection}>
				{displaySections.map(section => (
					<div key={section.id} className={styles.previewBlock}>
						<div className={styles.previewHeader}>
							<h3 className={styles.previewSectionTitle}>{section.title}</h3>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									const idx = sections.findIndex(s => s.id === section.id);
									if (idx >= 0) onSectionClick(idx);
								}}
							>
								修改
							</Button>
						</div>
						<ul className={styles.previewList}>
							{section.questions?.map((q, qi) => {
								const raw = props.localAnswers[q.id] ?? "";
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
										<span className={styles.previewAnswerLabel}>
											{q.title}
											{q.required && <span className={styles.requiredAsterisk}> *</span>}
										</span>
										<span>：</span>
										<span className={!displayValue && q.required ? styles.previewAnswerEmpty : ""}>{displayValue || "未填寫"}</span>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</div>
		);
	}

	// mode === "response"
	const { previewData } = props;
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
									if (targetIndex >= 0) onSectionClick(targetIndex);
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
