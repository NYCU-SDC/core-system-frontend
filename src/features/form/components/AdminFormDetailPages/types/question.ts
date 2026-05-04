import type { ProseMirrorLikeDocument } from "@/shared/utils/proseMirror";
import type { FormsQuestionRequest } from "@nycu-sdc/core-system-sdk";

export type Question = {
	type:
		| "SHORT_TEXT"
		| "LONG_TEXT"
		| "SINGLE_CHOICE"
		| "MULTIPLE_CHOICE"
		| "DROPDOWN"
		| "DETAILED_MULTIPLE_CHOICE"
		| "DATE"
		| "UPLOAD_FILE"
		| "LINEAR_SCALE"
		| "RANKING"
		| "HYPERLINK"
		| "RATING"
		| "OAUTH_CONNECT";
	title: string;
	description: ProseMirrorLikeDocument | null;
	required: boolean;
	isFromAnswer: boolean;
	sourceQuestionId?: string;
	options?: Array<Option>;
	detailOptions?: Array<DetailOption>;
	start?: number;
	end?: number;
	startLabel?: string;
	endLabel?: string;
	icon?: string;
	uploadAllowedFileTypes?: string[];
	uploadMaxFileAmount?: number;
	uploadMaxFileSizeLimit?: number;
	dateHasYear?: boolean;
	dateHasMonth?: boolean;
	dateHasDay?: boolean;
	dateHasMinDate?: boolean;
	dateHasMaxDate?: boolean;
	dateMinDate?: string;
	dateMaxDate?: string;
	url?: string;
	oauthProvider?: "GOOGLE" | "GITHUB";
};

export const QUESTION_FEATURES = {
	HAS_OPTIONS: ["options", "isFromAnswer", "sourceQuestionId"],
	HAS_DETAIL_OPTIONS: ["detailOptions"],
	HAS_SCALE: ["start", "end", "startLabel", "endLabel"],
	HAS_RATING: ["icon"],
	HAS_UPLOAD: ["uploadAllowedFileTypes", "uploadMaxFileAmount", "uploadMaxFileSizeLimit"],
	HAS_DATE: ["dateHasYear", "dateHasMonth", "dateHasDay", "dateHasMinDate", "dateHasMaxDate", "dateMinDate", "dateMaxDate"],
	HAS_URL: ["url"],
	HAS_OAUTH: ["oauthProvider"]
} as const;

export type QuestionFeatureKey = keyof typeof QUESTION_FEATURES;

export type QuestionTemplate = {
	icon: React.ReactNode;
	text: string;
	type: Question["type"];
	features: QuestionFeatureKey[];
	initialState: () => Partial<Question>;
	toApiPayload?: (question: Question, base: FormsQuestionRequest) => void;
};

export type Option = {
	id?: string;
	label: string;
	isOther?: boolean;
};

export type DetailOption = {
	id?: string;
	label: string;
	description: string;
};
