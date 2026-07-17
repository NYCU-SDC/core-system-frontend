import { proseMirrorToPlainText } from "@/features/form/utils/proseMirror";
import { Markdown } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "./FormQuestionWrapper.module.css";

interface FormQuestionWrapperProps {
	question: FormsQuestionResponse;
	children: React.ReactNode;
}

export const FormQuestionWrapper = ({ question, children }: FormQuestionWrapperProps) => {
	const description = question.descriptionHtml?.trim() || proseMirrorToPlainText(question.description).trim();

	return (
		<div key={question.id} className={styles.questionField}>
			<label className={styles.questionLabel}>
				{question.title}
				{question.required && <span className={styles.requiredAsterisk}> *</span>}
			</label>
			{description && <Markdown className={styles.questionDescription} content={description} />}
			{children}
		</div>
	);
};
