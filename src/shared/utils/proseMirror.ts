export type ProseMirrorLikeDocument = Record<string, unknown>;

export const EMPTY_PROSE_MIRROR_DOC: ProseMirrorLikeDocument = {
	type: "doc",
	content: [{ type: "paragraph" }]
};

const TYPE_TO_API_MAP: Record<string, string> = {
	hardBreak: "hard_break",
	horizontalRule: "horizontal_rule",
	codeBlock: "code_block",
	bulletList: "bullet_list",
	orderedList: "ordered_list",
	listItem: "list_item"
};

const TYPE_FROM_API_MAP = Object.fromEntries(Object.entries(TYPE_TO_API_MAP).map(([from, to]) => [to, from]));

const camelToSnake = (value: string) => value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const snakeToCamel = (value: string) => value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const transformProseMirror = (value: unknown, transformKey: (key: string) => string, transformType: (type: string) => string): unknown => {
	if (Array.isArray(value)) {
		return value.map(item => transformProseMirror(item, transformKey, transformType));
	}

	if (!value || typeof value !== "object") {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, nestedValue]) => {
			const nextKey = transformKey(key);
			const nextValue = key === "type" && typeof nestedValue === "string" ? transformType(nestedValue) : transformProseMirror(nestedValue, transformKey, transformType);
			return [nextKey, nextValue];
		})
	);
};

export const toApiProseMirror = (value: unknown): ProseMirrorLikeDocument =>
	transformProseMirror(normalizeProseMirrorDoc(value), camelToSnake, type => TYPE_TO_API_MAP[type] ?? type) as ProseMirrorLikeDocument;

export const fromApiProseMirror = (value: unknown): ProseMirrorLikeDocument =>
	transformProseMirror(normalizeProseMirrorDoc(value), snakeToCamel, type => TYPE_FROM_API_MAP[type] ?? type) as ProseMirrorLikeDocument;

export const normalizeProseMirrorDoc = (value: unknown): ProseMirrorLikeDocument => {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as ProseMirrorLikeDocument;
	}

	return EMPTY_PROSE_MIRROR_DOC;
};

export const serializeProseMirrorDoc = (value: unknown): string => JSON.stringify(normalizeProseMirrorDoc(value));
