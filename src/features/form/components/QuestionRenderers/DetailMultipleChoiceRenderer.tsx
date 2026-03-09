import { DetailedCheckbox } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "../FormFilloutPage.module.css";

export const DetailMultipleChoiceRenderer = ({ question, value, onAnswerChange }: { question: FormsQuestionResponse; value: string; onAnswerChange: (questionId: string, value: string) => void }) => {
	return (
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
						onAnswerChange(question.id, newValues.join(","));
					}}
				/>
			))}
		</div>
	);
};
