import type { Form } from "@/types/form.ts"

export interface FormCardProps {
	form: Form;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onPublish: (id: string) => void;
}

export interface FormEditorState {
	form: Partial<Form>;
	questions: Question[];
	isDirty: boolean;
	validationErrors: ValidationErrors;
}