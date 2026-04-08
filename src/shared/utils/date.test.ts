import { describe, expect, it } from "vitest";
import { NormalizeDateToUtc } from "./date";

describe("NormalizeDateToUtc", () => {
	it("returns start-of-day UTC suffix by default", () => {
		expect(NormalizeDateToUtc("2024-01-15")).toBe("2024-01-15T00:00:00Z");
	});

	it("returns end-of-day UTC suffix when endOfDay is true", () => {
		expect(NormalizeDateToUtc("2024-01-15", true)).toBe("2024-01-15T23:59:59Z");
	});

	it("returns start-of-day UTC suffix when endOfDay is explicitly false", () => {
		expect(NormalizeDateToUtc("2024-12-31", false)).toBe("2024-12-31T00:00:00Z");
	});

	it("returns undefined for empty string", () => {
		expect(NormalizeDateToUtc("")).toBeUndefined();
	});
});
