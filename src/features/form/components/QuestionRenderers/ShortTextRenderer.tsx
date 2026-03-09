import { Input } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";

export const ShortTextRenderer = ({ question, value, onAnswerChange }: { question: FormsQuestionResponse; value: string; onAnswerChange: (questionId: string, value: string) => void }) => {
	return <Input id={question.id} placeholder="請輸入..." value={value} onChange={e => onAnswerChange(question.id, e.target.value)} required={question.required} />;
};
