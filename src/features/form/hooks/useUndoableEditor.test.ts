import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUndoableEditor } from "./useUndoableEditor";

describe("useUndoableEditor", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("undoes and redoes immediate checkpoints", () => {
		const { result } = renderHook(() => useUndoableEditor({ value: "initial" }));

		act(() => result.current.setState({ value: "updated" }));
		expect(result.current.state).toEqual({ value: "updated" });
		expect(result.current.canUndo).toBe(true);

		act(() => result.current.undo());
		expect(result.current.state).toEqual({ value: "initial" });
		expect(result.current.canRedo).toBe(true);

		act(() => result.current.redo());
		expect(result.current.state).toEqual({ value: "updated" });
	});

	it("coalesces debounced edits into one checkpoint", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useUndoableEditor({ value: "" }, { debounceMs: 250 }));

		act(() => result.current.setState({ value: "a" }, { checkpoint: "debounced" }));
		act(() => result.current.setState({ value: "ab" }, { checkpoint: "debounced" }));
		expect(result.current.canUndo).toBe(false);

		act(() => vi.advanceTimersByTime(250));
		expect(result.current.canUndo).toBe(true);

		act(() => result.current.undo());
		expect(result.current.state).toEqual({ value: "" });
	});

	it("resets history when external state replaces the editor", () => {
		const { result } = renderHook(() => useUndoableEditor({ value: "initial" }));

		act(() => result.current.setState({ value: "draft" }));
		act(() => result.current.replaceState({ value: "server" }));

		expect(result.current.state).toEqual({ value: "server" });
		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
	});
});
