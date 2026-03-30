import { Markdown } from "@/shared/components";
import { htmlToMarkdown } from "@/shared/utils/htmlToMarkdown";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "./FormQuestionWrapper.module.css";

interface FormQuestionWrapperProps {
	question: FormsQuestionResponse;
	children: React.ReactNode;
}

export const FormQuestionWrapper = ({ question, children }: FormQuestionWrapperProps) => {
	return (
		<div key={question.id} className={styles.questionField}>
			<label className={styles.questionLabel}>
				{question.title}
				{question.required && <span className={styles.requiredAsterisk}> *</span>}
			</label>
			{question.description && <Markdown className={styles.questionDescription} content={htmlToMarkdown(question.description)} />}
			{children}
		</div>
	);
};
