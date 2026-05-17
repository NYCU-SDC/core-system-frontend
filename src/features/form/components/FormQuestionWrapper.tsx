import { proseMirrorToHtml } from "@/features/form/utils/proseMirror";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "./FormQuestionWrapper.module.css";

interface FormQuestionWrapperProps {
	question: FormsQuestionResponse;
	children: React.ReactNode;
}

export const FormQuestionWrapper = ({ question, children }: FormQuestionWrapperProps) => {
	const descriptionHtml = proseMirrorToHtml(question.description, question.descriptionHtml);

	return (
		<div key={question.id} className={styles.questionField}>
			<label className={styles.questionLabel}>
				{question.title}
				{question.required && <span className={styles.requiredAsterisk}> *</span>}
			</label>
			{descriptionHtml && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />}
			{children}
		</div>
	);
};
