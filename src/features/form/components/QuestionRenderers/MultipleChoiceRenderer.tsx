import { Checkbox, Input } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "../FormFilloutPage.module.css";

export const MultipleChoiceRenderer = ({
	question,
	value,
	onAnswerChange,
	onOtherTextChange,
	otherTextValue
}: {
	question: FormsQuestionResponse;
	value: string;
	onAnswerChange: (questionId: string, value: string) => void;
	onOtherTextChange: (questionId: string, value: string) => void;
	otherTextValue: string;
}) => {
	const choices = question.choices ?? [];
	const otherChoice = choices.find(choice => choice.isOther);
	const selectedIds = value ? value.split(",").filter(Boolean) : [];

	return (
		<>
			<div className={styles.choiceList}>
				{choices.map(choice => (
					<Checkbox
						key={choice.id}
						id={`${question.id}-${choice.id}`}
						label={choice.name}
						checked={selectedIds.includes(choice.id)}
						onCheckedChange={checked => {
							const newValues = checked ? [...selectedIds, choice.id] : selectedIds.filter(v => v !== choice.id);
							onAnswerChange(question.id, newValues.join(","));
							if (otherChoice?.id === choice.id && !checked) {
								onOtherTextChange(question.id, "");
							}
						}}
					/>
				))}
			</div>
			{otherChoice && selectedIds.includes(otherChoice.id) && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
		</>
	);
};
