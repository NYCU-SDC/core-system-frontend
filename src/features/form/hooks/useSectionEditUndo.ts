import type { Question } from "@/features/form/components/AdminFormDetailPages/types/question";
import { useUndoableEditor } from "@/features/form/hooks/useUndoableEditor";
import { useCallback, useEffect, useRef } from "react";

// Undo snapshot for questions and their aligned questionIds.
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

// Skip global undo/redo while focus is inside a ProseMirror editor.
const isProseMirrorFocused = () => {
	const active = document.activeElement;
	if (!(active instanceof HTMLElement)) return false;
	return active.isContentEditable || Boolean(active.closest('[contenteditable="true"], .ProseMirror'));
};

type UseSectionEditUndoOptions = {
	historyLimit?: number;
	disableKeyboardShortcuts?: boolean;
	// Wait for any in-flight autosave before changing history.
	beforeUndoRedo?: () => void | Promise<void>;
	// Handle the updated snapshot after undo/redo.
	afterUndoRedo?: (snapshot: SectionEditSnapshot) => void;
};

export const useSectionEditUndo = (initialState: SectionEditSnapshot, options: UseSectionEditUndoOptions = {}) => {
	const { state, setState, replaceState, undo, redo, resetHistory, flushCheckpoint, canUndo, canRedo, debugHistory } = useUndoableEditor<SectionEditSnapshot>(initialState, {
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

	// Update both arrays in one checkpoint so the change uses one undo step.
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
		onTextInputBlurCheckpoint,
		// Read-only undo stack for the history log UI.
		history: debugHistory
	};
};
