export type Question = {
	type: "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN" | "DETAILED_MULTIPLE_CHOICE" | "DATE" | "UPLOAD_FILE" | "LINEAR_SCALE" | "RANKING" | "HYPERLINK" | "RATING";
	title: string;
	description: string;
	isFromAnswer: boolean;
	options?: Array<Option>;
	start?: number;
	end?: number;
	icon?: "STAR" | "HEART" | "GOOD";
};

export type Option = {
	label: string;
	isOther?: boolean;
};
