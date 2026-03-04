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
	description: string;
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

export type Option = {
	/** Stable identity for React key – use API choice ID or a client-side UUID */
	id?: string;
	label: string;
	isOther?: boolean;
};

export type DetailOption = {
	/** Stable identity for React key – use API choice ID or a client-side UUID */
	id?: string;
	label: string;
	description: string;
};
