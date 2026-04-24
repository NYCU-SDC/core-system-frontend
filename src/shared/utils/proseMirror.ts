export type ProseMirrorLikeDocument = Record<string, unknown>;

export const EMPTY_PROSE_MIRROR_DOC: ProseMirrorLikeDocument = {
	type: "doc",
	content: [{ type: "paragraph" }]
};

export const normalizeProseMirrorDoc = (value: unknown): ProseMirrorLikeDocument => {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as ProseMirrorLikeDocument;
	}

	return EMPTY_PROSE_MIRROR_DOC;
};

export const serializeProseMirrorDoc = (value: unknown): string => JSON.stringify(normalizeProseMirrorDoc(value));
