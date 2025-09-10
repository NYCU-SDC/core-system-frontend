export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'date';

export interface BaseQuestion {
	id: string;
	formId: string;
	type: QuestionType;
	title: string;
	description?: string;
	required: boolean;
	order: number;
	choices: Choice[];
	createdAt: string;
	updatedAt: string;
}

export interface ShortTextQuestion extends BaseQuestion {
	type: 'short_text';
	//placeholder?: string;
	//maxLength?: number;
}

export interface LongTextQuestion extends BaseQuestion {
	type: 'long_text';
	//placeholder?: string;
	//maxLength?: number;
	//rows?: number;
}

export interface Choice {
	id: string;
	name: string;
	//label: string;
	//value: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
	type: 'single_choice';
	choices: Choice[];
	//allowOther?: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
	type: 'multiple_choice';
	choices: Choice[];
	//allowOther?: boolean;
	//minSelections?: number;
	//maxSelections?: number;
}

export interface DateQuestion extends BaseQuestion {
	type: 'date';
	//dateFormat?: 'date' | 'datetime' | 'time';
	//minDate?: string;
	//maxDate?: string;
}

export type Question =
	| ShortTextQuestion
	| LongTextQuestion
	| SingleChoiceQuestion
	| MultipleChoiceQuestion
	| DateQuestion;

export const QuestionTypeLabels: Record<QuestionType, string> = {
	short_text: 'Short Text',
	long_text: 'Long Text',
	single_choice: 'Single Choice',
	multiple_choice: 'Multiple Choice',
	date: 'Date'
};

export const createNewQuestion = (type: QuestionType, order: number): Question => {
	const baseId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const base = {
		id: baseId,
		type,
		title: '',
		description: '',
		required: false,
		order
	};

	switch (type) {
		case 'short_text':
			return {
				...base,
				type: 'short_text',
			} as ShortTextQuestion;

		case 'long_text':
			return {
				...base,
				type: 'long_text',
			} as LongTextQuestion;

		case 'single_choice':
			return {
				...base,
				type: "single_choice",
				choices: []
			} as unknown as SingleChoiceQuestion;

		case 'multiple_choice':
			return {
				...base,
				type: "multiple_choice",
				choices: []
			} as unknown as MultipleChoiceQuestion;

		case 'date':
			return {
				...base,
				type: 'date',
			} as DateQuestion;

		default:
			throw new Error(`Unknown question type: ${type}`);
	}
};