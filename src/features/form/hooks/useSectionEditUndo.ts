import type { Question } from "@/features/form/components/AdminFormDetailPages/types/question";
import { useUndoableEditor } from "@/features/form/hooks/useUndoableEditor";
import { useCallback, useEffect, useRef } from "react";

// Editor-end undo snapshot. questions and questionIds are index-aligned parallel
// arrays (questionIds[i] is the server id for questions[i]); they MUST move together
// in a single snapshot, otherwise undoing one without the other misaligns the
// server-id <-> question mapping and autosave PUTs to the wrong row.
export type SectionEditSnapshot = {
	questions: Question[];
	questionIds: (string | undefined)[];
};

export const SECTION_EDIT_UNDO_CONFIG = {
	historyLimit: 70
} as const;

type CheckpointMode = "immediate" | "debounced" | "none";

const NON_TEXT_INPUT_TYPES = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]);

const isTextInputTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true;
	if (target instanceof HTMLTextAreaElement) return true;
	if (target instanceof HTMLInputElement) {
		return !NON_TEXT_INPUT_TYPES.has(target.type);
	}
	return false;
};

// CLAUDE.md 鐵則 3: when a ProseMirror (TipTap) editor is focused, Mod-z / Ctrl-Z must
// be left to PM's own history. The section description AND every question description are
// MarkdownEditor (contenteditable), so the global keydown handler must bail when focus is
// inside one.
const isProseMirrorFocused = () => {
	const active = document.activeElement;
	if (!(active instanceof HTMLElement)) return false;
	return active.isContentEditable || Boolean(active.closest('[contenteditable="true"], .ProseMirror'));
};

type UseSectionEditUndoOptions = {
	historyLimit?: number;
	disableKeyboardShortcuts?: boolean;
	// await any in-flight autosave flush before mutating history (方案 a hard requirement 3).
	beforeUndoRedo?: () => void | Promise<void>;
	// re-mark the post-undo/redo snapshot dirty so existing autosave converges the backend
	// (方案 a hard requirement 1). Receives the new snapshot so callers can read the
	// authoritative post-change length without depending on a not-yet-synced ref.
	afterUndoRedo?: (snapshot: SectionEditSnapshot) => void;
};

export const useSectionEditUndo = (initialState: SectionEditSnapshot, options: UseSectionEditUndoOptions = {}) => {
	const { state, setState, replaceState, undo, redo, resetHistory, flushCheckpoint, canUndo, canRedo } = useUndoableEditor<SectionEditSnapshot>(initialState, {
		limit: options.historyLimit ?? SECTION_EDIT_UNDO_CONFIG.historyLimit
	});

	const questions = state.questions;
	const questionIds = state.questionIds;

	const setQuestions = useCallback(
		(updater: Question[] | ((prev: Question[]) => Question[]), checkpoint: CheckpointMode = "immediate") => {
			setState(prev => ({ ...prev, questions: typeof updater === "function" ? (updater as (prev: Question[]) => Question[])(prev.questions) : updater }), { checkpoint });
		},
		[setState]
	);

	const updateQuestionAt = useCallback(
		(index: number, updater: (question: Question) => Question, checkpoint: CheckpointMode = "immediate") => {
			setState(prev => ({ ...prev, questions: prev.questions.map((question, currentIndex) => (currentIndex === index ? updater(question) : question)) }), { checkpoint });
		},
		[setState]
	);

	const setQuestionIds = useCallback(
		(nextQuestionIds: (string | undefined)[], checkpoint: CheckpointMode = "immediate") => {
			setState(prev => ({ ...prev, questionIds: nextQuestionIds }), { checkpoint });
		},
		[setState]
	);

	// Atomic update of BOTH arrays in a single checkpoint — use for add / remove / duplicate /
	// reorder so the action costs exactly one undo step (two separate immediate setStates would
	// push two snapshots and need two undos — the multi-snapshot pitfall from CLAUDE.md).
	const setSnapshot = useCallback(
		(next: SectionEditSnapshot | ((prev: SectionEditSnapshot) => SectionEditSnapshot), checkpoint: CheckpointMode = "immediate") => {
			setState(prev => (typeof next === "function" ? (next as (prev: SectionEditSnapshot) => SectionEditSnapshot)(prev) : next), { checkpoint });
		},
		[setState]
	);

	// Seed the editor baseline (first hydration per section). Clears past/future so the loaded
	// form is NOT an undoable step.
	const hydrate = useCallback(
		(snapshot: SectionEditSnapshot) => {
			replaceState(snapshot);
		},
		[replaceState]
	);

	const pendingAfterRef = useRef(false);

	// options is typically a fresh object each render (inline callbacks); keep a ref so the
	// undo/redo callbacks and the window keydown listener stay stable across renders.
	const optionsRef = useRef(options);
	useEffect(() => {
		optionsRef.current = options;
	});

	const runUndo = useCallback(async () => {
		if (!canUndo) return;
		await optionsRef.current.beforeUndoRedo?.();
		pendingAfterRef.current = true;
		undo();
	}, [canUndo, undo]);

	const runRedo = useCallback(async () => {
		if (!canRedo) return;
		await optionsRef.current.beforeUndoRedo?.();
		pendingAfterRef.current = true;
		redo();
	}, [canRedo, redo]);

	// Fire afterUndoRedo only once the engine state has actually settled to the new snapshot,
	// so callers see the authoritative post-change questions length.
	useEffect(() => {
		if (!pendingAfterRef.current) return;
		pendingAfterRef.current = false;
		optionsRef.current.afterUndoRedo?.(state);
	}, [state]);

	const onTextInputBlurCheckpoint = useCallback(
		(event: React.FocusEvent<HTMLElement>) => {
			if (!isTextInputTarget(event.target)) return;
			flushCheckpoint();
		},
		[flushCheckpoint]
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (optionsRef.current.disableKeyboardShortcuts) return;
			if (event.isComposing) return;
			// Let a focused ProseMirror editor own Mod-z / Ctrl-Z.
			if (isProseMirrorFocused()) return;
			const modifierPressed = event.metaKey || event.ctrlKey;
			if (!modifierPressed) return;

			const lowerKey = event.key.toLowerCase();
			const isUndo = lowerKey === "z" && !event.shiftKey;
			const isRedo = (lowerKey === "z" && event.shiftKey) || (lowerKey === "y" && event.ctrlKey && !event.metaKey);
			if (!isUndo && !isRedo) return;

			event.preventDefault();
			if (isUndo) {
				void runUndo();
				return;
			}
			void runRedo();
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [runUndo, runRedo]);

	return {
		questions,
		questionIds,
		setQuestions,
		updateQuestionAt,
		setQuestionIds,
		setSnapshot,
		hydrate,
		resetHistory,
		flushCheckpoint,
		undo: runUndo,
		redo: runRedo,
		canUndo,
		canRedo,
		onTextInputBlurCheckpoint
	};
};
