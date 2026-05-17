import type { ProseMirrorDocument, ProseMirrorDocumentUpdate } from "@nycu-sdc/core-system-sdk";

const EMPTY_DOC: ProseMirrorDocument = {
	type: "doc",
	content: [{ type: "paragraph", content: [] }]
};

export const textToProseMirrorDocument = (text: string): ProseMirrorDocument => {
	const trimmed = text.trim();
	if (!trimmed) return EMPTY_DOC;

	return {
		type: "doc",
		content: trimmed.split(/\n{2,}/).map(paragraph => ({
			type: "paragraph",
			content: paragraph.length > 0 ? [{ type: "text", text: paragraph }] : []
		}))
	};
};

export const textToProseMirrorDocumentUpdate = (text: string): ProseMirrorDocumentUpdate => textToProseMirrorDocument(text);

export const proseMirrorToPlainText = (doc: ProseMirrorDocument | undefined | null): string => {
	if (!doc?.content) return "";

	const readNode = (node: NonNullable<ProseMirrorDocument["content"]>[number]): string => {
		const text = node.text ?? "";
		const children = node.content?.map(readNode).join("") ?? "";
		return text + children;
	};

	return doc.content.map(readNode).join("\n\n");
};
