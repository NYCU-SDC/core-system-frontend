import TurndownService from "turndown";

let turndown: TurndownService | null = null;

const getTurndownService = () => {
	if (!turndown) {
		turndown = new TurndownService({
			headingStyle: "atx",
			codeBlockStyle: "fenced",
			bulletListMarker: "-"
		});
		turndown.keep(["table", "thead", "tbody", "tr", "td", "th"]);
		turndown.addRule("softBreak", {
			filter: ["br"],
			replacement: () => "\n"
		});
	}

	return turndown;
};

export const htmlToMarkdown = (value: string | null | undefined) => {
	if (!value) return "";
	const trimmed = value.trim();
	if (!trimmed.includes("<")) return value;

	try {
		return getTurndownService().turndown(trimmed);
	} catch {
		return value;
	}
};
