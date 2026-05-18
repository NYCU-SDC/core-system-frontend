import { Select } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";

export const DropdownRenderer = ({ question, value, onAnswerChange }: { question: FormsQuestionResponse; value: string; onAnswerChange: (questionId: string, value: string) => void }) => {
	const choices = (question.choices ?? []).filter(choice => !!choice && !!choice.id);
	return (
		<Select options={choices.map(choice => ({ value: choice.id, label: choice.name ?? choice.id }))} value={value || undefined} onValueChange={newValue => onAnswerChange(question.id, newValue)} />
	);
};
