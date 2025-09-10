import type { FormData } from "@/types/form.ts"
import type { Question } from "@/types/question.ts";

export interface FormCardProps {
	form: FormData;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	onPublish?: (id: string) => void;
	onViewResult?: (id: string) => void;
}

export interface ValidationErrors {
	title?: string;
	description?: string;
	units?: string;
	questions?: Record<string, string>; // questionId -> error message
	general?: string;
}

export interface FormEditorState {
	form: Partial<FormData>;
	questions: Question[];
	isDirty: boolean;
	validationErrors: ValidationErrors;
}

/*export interface FormValidationResult {
	isValid: boolean;
	errors: ValidationErrors;
}*/

export interface FormEditorConfig {
	autoSave: boolean;
	autoSaveInterval: number; // 秒
	maxTitleLength: number;
	maxDescriptionLength: number;
	maxQuestionsCount: number;
}

export type FormUpdateAction =
	| { type: 'UPDATE_FORM'; payload: Partial<FormData> }
	| { type: 'ADD_QUESTION'; payload: Question }
	| { type: 'UPDATE_QUESTION'; payload: { id: string; question: Partial<Question> } }
	| { type: 'DELETE_QUESTION'; payload: { id: string } }
	| { type: 'REORDER_QUESTIONS'; payload: { questions: Question[] } }
	| { type: 'SET_VALIDATION_ERRORS'; payload: ValidationErrors }
	| { type: 'SET_DIRTY'; payload: boolean };

export interface FormOperationResult {
	success: boolean;
	message?: string;
	data?: any;
	errors?: ValidationErrors;
}