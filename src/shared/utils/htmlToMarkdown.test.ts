import { afterEach, describe, expect, it, vi } from "vitest";
import { htmlToMarkdown } from "./htmlToMarkdown";

afterEach(() => {
	vi.doUnmock("turndown");
});

describe("htmlToMarkdown", () => {
	it("returns empty strings for nullish or empty values", () => {
		expect(htmlToMarkdown(null)).toBe("");
		expect(htmlToMarkdown(undefined)).toBe("");
		expect(htmlToMarkdown("")).toBe("");
	});

	it("passes through plain text without trimming", () => {
		expect(htmlToMarkdown("  plain text  ")).toBe("  plain text  ");
	});

	it("converts br tags to line breaks", () => {
		expect(htmlToMarkdown("<p>first<br>second</p>")).toBe("first\nsecond");
	});

	it("preserves table markup", () => {
		const result = htmlToMarkdown("<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>");

		expect(result).toContain("<table>");
		expect(result).toContain("<td>A</td>");
		expect(result).toContain("<td>B</td>");
	});

	it("falls back to the original value when conversion fails", async () => {
		vi.resetModules();
		vi.doMock("turndown", () => ({
			default: class TurndownService {
				keep() {}
				addRule() {}
				turndown() {
					throw new Error("conversion failed");
				}
			}
		}));

		const { htmlToMarkdown: failingHtmlToMarkdown } = await import("./htmlToMarkdown");

		expect(failingHtmlToMarkdown("<p>raw</p>")).toBe("<p>raw</p>");
	});
});
