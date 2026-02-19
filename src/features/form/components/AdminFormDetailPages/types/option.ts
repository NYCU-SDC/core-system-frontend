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
	options?: Array<Option>;
	detailOptions?: Array<DetailOption>;
	start?: number;
	end?: number;
	startLabel?: string;
	endLabel?: string;
	icon?: "STAR" | "HEART" | "GOOD";
	url?: string;
	oauthProvider?: "GOOGLE" | "GITHUB";
};

export type Option = {
	label: string;
	isOther?: boolean;
};

export type DetailOption = {
	label: string;
	description: string;
};
