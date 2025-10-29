import type { BaseQuestion, QuestionType, QuestionResponse } from "@/types/form.ts";

export type response = {
	id: string;
	submittedBy: string;
	createdAt: string;
	updatedAt: string;
};

export type FormQuestionResponses = {
	formId: string;
	responses: response[];
};

export type answer = {
	id: string;
	responseId: string;
	submittedBy: string;
	value: string;
	createdAt: string;
	updatedAt: string;
};

export type QuestionResponses = {
	question: QuestionResponse;
	answers: answer[];
};

export interface ShortTextQuestion extends BaseQuestion {
	type: "short_text";
	placeholder?: string;
	maxLength?: number;
}

export interface LongTextQuestion extends BaseQuestion {
	type: "long_text";
	placeholder?: string;
	maxLength?: number;
	rows?: number;
}

export interface ChoiceOption {
	id: string;
	name: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
	type: "single_choice";
	options: ChoiceOption[];
	allowOther?: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
	type: "multiple_choice";
	options: ChoiceOption[];
	allowOther?: boolean;
	minSelections?: number;
	maxSelections?: number;
}

export interface DateQuestion extends BaseQuestion {
	type: "date";
	dateFormat?: "date" | "datetime" | "time";
	minDate?: string;
	maxDate?: string;
}

export type Question = ShortTextQuestion | LongTextQuestion | SingleChoiceQuestion | MultipleChoiceQuestion | DateQuestion;

export const QuestionTypeLabels: Record<QuestionType, string> = {
	short_text: "Short Text",
	long_text: "Long Text",
	single_choice: "Single Choice",
	multiple_choice: "Multiple Choice",
	date: "Date"
};

export const createNewQuestion = (type: QuestionType, order: number): BaseQuestion => {
	const baseId = `question_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const base: BaseQuestion = {
		id: baseId,
		formId: "", // Will be set when added to form
		type,
		title: "untitled",
		description: "",
		required: true,
		order: order,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	switch (type) {
		case "short_text":
			return {
				...base,
				type: "short_text"
			};

		case "long_text":
			return {
				...base,
				type: "long_text"
			};

		case "single_choice":
			return {
				...base,
				type: "single_choice",
				choices: [{ id: `choice_temp_${Date.now()}`, name: "Choice 1" }]
			};

		case "multiple_choice":
			return {
				...base,
				type: "multiple_choice",
				choices: [{ id: `choice_temp_${Date.now()}`, name: "Choice 1" }]
			};

		case "date":
			return {
				...base,
				type: "date"
			};

		default:
			throw new Error(`Unknown question type: ${type}`);
	}
};
