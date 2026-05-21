import type { HtmlContent, ProseMirrorDocument, ProseMirrorDocumentUpdate, ProseMirrorNode } from "@nycu-sdc/core-system-sdk";

export const EMPTY_PROSE_MIRROR_DOCUMENT: ProseMirrorDocument = {
	type: "doc",
	content: []
};

const textFromNode = (node: ProseMirrorNode): string => {
	if (node.type === "text") return node.text ?? "";
	const childText = node.content?.map(textFromNode).join("") ?? "";
	return node.type === "paragraph" ? `${childText}\n` : childText;
};

export const proseMirrorToPlainText = (document: ProseMirrorDocument | string | null | undefined): string => {
	if (!document) return "";
	if (typeof document === "string") return document;
	return document.content?.map(textFromNode).join("").trimEnd() ?? "";
};

export const proseMirrorFromText = (text: string): ProseMirrorDocument => ({
	type: "doc",
	content: text.split(/\r?\n/).map(line => ({
		type: "paragraph",
		content: line ? [{ type: "text", text: line }] : []
	}))
});

export const proseMirrorUpdateFromText = (text: string): ProseMirrorDocumentUpdate => proseMirrorFromText(text);

const escapeHtml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export const proseMirrorToHtml = (document: ProseMirrorDocument | string | null | undefined, renderedHtml?: HtmlContent | null): string => {
	if (renderedHtml) return renderedHtml;
	const text = proseMirrorToPlainText(document);
	if (!text.trim()) return "";
	return text
		.split(/\n{2,}/)
		.map(paragraph => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
		.join("");
};

export const hasProseMirrorContent = (document: ProseMirrorDocument | string | null | undefined, renderedHtml?: HtmlContent | null): boolean =>
	Boolean(renderedHtml?.trim() || proseMirrorToPlainText(document).trim());
