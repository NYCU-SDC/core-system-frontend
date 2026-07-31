import { useUndoableEditor } from "@/features/form/hooks/useUndoableEditor";
import { useCallback, useEffect } from "react";

export type IrreversibleKind = "upload" | "oauth" | "workflow";

export type FilloutSnapshot = {
	answers: Record<string, string>;
	otherTexts: Record<string, string>;
	// Marks a no-op undo step for irreversible actions.
	noop?: { kind: IrreversibleKind } | null;
};

export const FILLOUT_UNDO_CONFIG = {
	historyLimit: 30
} as const;

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

// Leave Mod-z / Ctrl-Z to ProseMirror when the editor is focused.
const isProseMirrorFocused = () => {
	const active = document.activeElement;
	if (!(active instanceof HTMLElement)) return false;
	return active.isContentEditable || Boolean(active.closest('[contenteditable="true"], .ProseMirror'));
};

type UseFilloutUndoOptions = {
	historyLimit?: number;
	disableKeyboardShortcuts?: boolean;
};

export const useFilloutUndo = (initialState: FilloutSnapshot, options: UseFilloutUndoOptions = {}) => {
	const { state, setState, replaceState, undo, redo, resetHistory, flushCheckpoint, canUndo, canRedo } = useUndoableEditor<FilloutSnapshot>(initialState, {
		limit: options.historyLimit ?? FILLOUT_UNDO_CONFIG.historyLimit
	});

	const onTextInputBlurCheckpoint = useCallback(
		(event: React.FocusEvent<HTMLElement>) => {
			if (!isTextInputTarget(event.target)) return;
			flushCheckpoint();
		},
		[flushCheckpoint]
	);

	// Insert a no-op marker so the first undo can signal an irreversible step.
	const commitIrreversible = useCallback(
		(kind: IrreversibleKind, updater: (prev: FilloutSnapshot) => FilloutSnapshot) => {
			flushCheckpoint();
			setState(prev => ({ ...updater(prev), noop: { kind } }), { checkpoint: "immediate" });
			setState(prev => ({ ...prev, noop: null }), { checkpoint: "immediate" });
		},
		[flushCheckpoint, setState]
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (options.disableKeyboardShortcuts) return;
			if (event.isComposing) return;
			// Let a focused ProseMirror editor own Mod-z / Ctrl-Z / Ctrl-Shift-Z.
			if (isProseMirrorFocused()) return;
			const modifierPressed = event.metaKey || event.ctrlKey;
			if (!modifierPressed) return;

			const lowerKey = event.key.toLowerCase();
			const isUndo = lowerKey === "z" && !event.shiftKey;
			const isRedo = (lowerKey === "z" && event.shiftKey) || (lowerKey === "y" && event.ctrlKey && !event.metaKey);
			if (!isUndo && !isRedo) return;

			event.preventDefault();
			flushCheckpoint();
			if (isUndo) {
				if (!canUndo) return;
				undo();
				return;
			}
			if (!canRedo) return;
			redo();
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [canRedo, canUndo, flushCheckpoint, options.disableKeyboardShortcuts, redo, undo]);

	return {
		state,
		setState,
		replaceState,
		undo,
		redo,
		resetHistory,
		flushCheckpoint,
		canUndo,
		canRedo,
		onTextInputBlurCheckpoint,
		commitIrreversible
	};
};
