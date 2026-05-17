import { describe, expect, it } from "vitest";
import { EMPTY_PROSE_MIRROR_DOC, extractTextFromProseMirror, fromApiProseMirror, normalizeProseMirrorDoc, toApiProseMirror } from "./proseMirror";

describe("proseMirror utils", () => {
	it("converts camel-case ProseMirror nodes to API snake-case recursively", () => {
		expect(
			toApiProseMirror({
				type: "doc",
				content: [
					{
						type: "bulletList",
						attrs: { listStyleType: "disc" },
						content: [
							{
								type: "listItem",
								content: [{ type: "text", text: "Item" }, { type: "hardBreak" }]
							}
						]
					},
					{ type: "horizontalRule" },
					{ type: "codeBlock", attrs: { languageName: "ts" } }
				]
			})
		).toEqual({
			type: "doc",
			content: [
				{
					type: "bullet_list",
					attrs: { list_style_type: "disc" },
					content: [
						{
							type: "list_item",
							content: [{ type: "text", text: "Item" }, { type: "hard_break" }]
						}
					]
				},
				{ type: "horizontal_rule" },
				{ type: "code_block", attrs: { language_name: "ts" } }
			]
		});
	});

	it("converts API snake-case ProseMirror nodes back to camel-case recursively", () => {
		expect(
			fromApiProseMirror({
				type: "doc",
				content: [
					{
						type: "ordered_list",
						attrs: { start_number: 3 },
						content: [{ type: "list_item", content: [{ type: "hard_break" }] }]
					}
				]
			})
		).toEqual({
			type: "doc",
			content: [
				{
					type: "orderedList",
					attrs: { startNumber: 3 },
					content: [{ type: "listItem", content: [{ type: "hardBreak" }] }]
				}
			]
		});
	});

	it("round-trips supported node types", () => {
		const doc = {
			type: "doc",
			content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }]
		};

		expect(fromApiProseMirror(toApiProseMirror(doc))).toEqual(doc);
	});

	it("normalizes invalid documents to the empty document", () => {
		expect(normalizeProseMirrorDoc(null)).toEqual(EMPTY_PROSE_MIRROR_DOC);
		expect(normalizeProseMirrorDoc("plain text")).toEqual(EMPTY_PROSE_MIRROR_DOC);
	});

	it("extracts text from nested content", () => {
		expect(
			extractTextFromProseMirror({
				type: "doc",
				content: [
					{ type: "paragraph", content: [{ type: "text", text: "Hello" }] },
					{ type: "paragraph", content: [{ type: "text", text: "world" }] }
				]
			})
		).toBe("Hello world");
	});
});
