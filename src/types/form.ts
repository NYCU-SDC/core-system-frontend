export type UUID = string;
export type FormStatus = 'draft' | 'published';
export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'date';

export interface FormData {
	id: UUID;
	title: string;
	description: string;
	status: FormStatus;
	unitId: UUID[];
	lastEditor: UUID;
	createdAt: string;
	updatedAt: string;
}

export interface FormRequest {
	title: string;
	description: string;
	unitIds: string[];
}

export interface ChoiceOption {
	name: string;
}

export interface Choice {
	id: UUID;
	name: string;
}

export interface BaseQuestion {
	id: UUID;
	formId: UUID;
	required: boolean;
	type: QuestionType;
	title: string;
	description: string;
	order: number;
	choices?: Choice[];
	createdAt: string;
	updatedAt: string;
}

export interface QuestionRequest {
	required: boolean;
	type: QuestionType;
	title: string;
	description: string;
	order: number;
	choices?: ChoiceOption[];
}

export interface RecipientSelectionRequest {
	unitIds?: UUID[];
}

/*export interface RecipientUser {
	id: UUID;
	name: string;
	organizationId?: UUID;
	unitId?: UUID;
}*/

export interface RecipientSelectionResponse {
	units: Array<{
		id: string;
		name: string;
		memberCount: number;
	}>;
	totalRecipients: number;
}

export interface AnswerRequest {
	questionId: UUID;
	value: string;
}

export interface SubmitRequest {
	answers: AnswerRequest[];
}

export interface SubmitResponse {
	id: UUID;
	formId: UUID;
	createdAt: string;
	updatedAt: string;
}

export interface ResponseJSON {
	id: UUID;
	submittedBy: UUID;
	createdAt: string;
	updatedAt: string;
}

export interface ListResponse {
	formId: UUID;
	responses: ResponseJSON[];
}

export interface QuestionAnswerForGetResponse {
	questionId: UUID;
	answer: string;
}

export interface GetResponse {
	id: UUID;
	formId: UUID;
	submittedBy: UUID;
	questionAnswerPairs: QuestionAnswerForGetResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface AnswerForQuestionResponse {
	id: UUID;
	responseId: UUID;
	submittedBy: UUID;
	value: string;
	createdAt: string;
	updatedAt: string;
}

export interface AnswersForQuestionResponse {
	question: BaseQuestion;
	answers: AnswerForQuestionResponse[];
}

export interface ProblemDetail {
	title: string;
	status: number;
	type: string;
	detail: string;
}

export interface NotFound {
	title: 'Not Found';
	status: 404;
	type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404';
	detail: string;
}

export interface Unauthorized {
	title: 'Unauthorized';
	status: 401;
	type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401';
	detail: string;
}

