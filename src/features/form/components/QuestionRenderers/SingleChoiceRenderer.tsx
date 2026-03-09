import { Input, Radio } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";

export const SingleChoiceRenderer = ({
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

	return (
		<>
			<Radio
				options={choices.map(choice => ({ value: choice.id, label: choice.name }))}
				value={value}
				onValueChange={newValue => {
					onAnswerChange(question.id, newValue);
					if (newValue !== otherChoice?.id) {
						onOtherTextChange(question.id, "");
					}
				}}
			/>
			{otherChoice && value === otherChoice.id && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
		</>
	);
};
