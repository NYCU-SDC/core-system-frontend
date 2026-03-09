import { Input } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";

export const HyperlinkRenderer = ({ question, value, onAnswerChange }: { question: FormsQuestionResponse; value: string; onAnswerChange: (questionId: string, value: string) => void }) => {
	const isValidUrl = (url: string): boolean => {
		try {
			const parsed = new URL(url);
			return parsed.protocol === "http:" || parsed.protocol === "https:";
		} catch {
			return false;
		}
	};

	return (
		<Input
			id={question.id}
			placeholder="https://"
			value={value}
			onChange={e => onAnswerChange(question.id, e.target.value)}
			required={question.required}
			error={value && !isValidUrl(value) ? "請輸入有效的網址（需以 http:// 或 https:// 開頭）" : ""}
		/>
	);
};
