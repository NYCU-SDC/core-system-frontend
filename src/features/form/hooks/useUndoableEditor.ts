import { useCallback, useEffect, useRef, useState } from "react";

type HistoryState<T> = {
	past: T[];
	present: T;
	future: T[];
};

type CheckpointMode = "immediate" | "debounced" | "none";

type SetStateOptions = {
	checkpoint?: CheckpointMode;
};

type UseUndoableEditorOptions<T> = {
	limit?: number;
	debounceMs?: number;
	normalizeState?: (state: T) => T;
};

const DEFAULT_HISTORY_LIMIT = 70;
const DEFAULT_DEBOUNCE_MS = 800;

const cloneValue = <T>(value: T): T => structuredClone(value);

const isEqual = <T>(left: T, right: T) => JSON.stringify(left) === JSON.stringify(right);

const appendPast = <T>(past: T[], snapshot: T, limit: number) => {
	const nextPast = [...past, cloneValue(snapshot)];
	return nextPast.length > limit ? nextPast.slice(nextPast.length - limit) : nextPast;
};

export const useUndoableEditor = <T>(initialState: T, options: UseUndoableEditorOptions<T> = {}) => {
	const limit = options.limit ?? DEFAULT_HISTORY_LIMIT;
	const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
	const normalizeState = options.normalizeState;
	const normalize = useCallback((value: T) => (normalizeState ? normalizeState(cloneValue(value)) : cloneValue(value)), [normalizeState]);
	const [state, setLiveState] = useState<T>(() => normalize(initialState));
	const [history, setHistory] = useState<HistoryState<T>>(() => ({
		past: [],
		present: normalize(initialState),
		future: []
	}));
	const historyRef = useRef<HistoryState<T>>({
		past: [],
		present: normalize(initialState),
		future: []
	});
	const timerRef = useRef<number | null>(null);
	const pendingCheckpointRef = useRef<T | null>(null);
	const skipNextDebounceRef = useRef(false);

	const clearPendingTimer = useCallback(() => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const commitSnapshot = useCallback(
		(snapshot: T) => {
			clearPendingTimer();
			pendingCheckpointRef.current = null;
			const prev = historyRef.current;
			if (isEqual(snapshot, prev.present)) {
				return;
			}

			const nextHistory = {
				past: appendPast(prev.past, prev.present, limit),
				present: cloneValue(snapshot),
				future: []
			};

			historyRef.current = nextHistory;
			setHistory(nextHistory);
		},
		[clearPendingTimer, limit]
	);

	const setState = useCallback(
		(updater: T | ((prev: T) => T), setOptions?: SetStateOptions) => {
			const checkpoint = setOptions?.checkpoint ?? "immediate";

			setLiveState(prev => {
				const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;
				const clonedNext = normalize(next);
				if (checkpoint === "immediate") {
					commitSnapshot(clonedNext);
				} else if (checkpoint === "debounced") {
					pendingCheckpointRef.current = clonedNext;
				} else {
					clearPendingTimer();
					pendingCheckpointRef.current = null;
				}
				return clonedNext;
			});
		},
		[clearPendingTimer, commitSnapshot, normalize]
	);

	const replaceState = useCallback(
		(nextState: T) => {
			const clonedState = normalize(nextState);
			skipNextDebounceRef.current = true;
			clearPendingTimer();
			pendingCheckpointRef.current = null;
			setLiveState(clonedState);
			const nextHistory = {
				past: [],
				present: cloneValue(clonedState),
				future: []
			};
			historyRef.current = nextHistory;
			setHistory(nextHistory);
		},
		[clearPendingTimer, normalize]
	);

	const flushCheckpoint = useCallback(() => {
		if (pendingCheckpointRef.current !== null) {
			commitSnapshot(pendingCheckpointRef.current);
		}
	}, [commitSnapshot]);

	const undo = useCallback(() => {
		flushCheckpoint();
		const prev = historyRef.current;
		if (prev.past.length === 0) return;
		const previous = prev.past[prev.past.length - 1];
		const nextState = normalize(previous);
		const nextHistory = {
			past: prev.past.slice(0, -1),
			present: normalize(previous),
			future: [cloneValue(prev.present), ...prev.future]
		};
		historyRef.current = nextHistory;
		setHistory(nextHistory);
		if (nextState !== null) {
			skipNextDebounceRef.current = true;
			setLiveState(nextState);
		}
	}, [flushCheckpoint, normalize]);

	const redo = useCallback(() => {
		flushCheckpoint();
		const prev = historyRef.current;
		if (prev.future.length === 0) return;
		const [next, ...remainingFuture] = prev.future;
		const nextState = normalize(next);
		const nextHistory = {
			past: appendPast(prev.past, prev.present, limit),
			present: normalize(next),
			future: remainingFuture
		};
		historyRef.current = nextHistory;
		setHistory(nextHistory);
		if (nextState !== null) {
			skipNextDebounceRef.current = true;
			setLiveState(nextState);
		}
	}, [flushCheckpoint, limit, normalize]);

	const resetHistory = useCallback(() => {
		flushCheckpoint();
		const nextHistory = {
			past: [],
			present: normalize(state),
			future: []
		};
		historyRef.current = nextHistory;
		setHistory(nextHistory);
	}, [flushCheckpoint, normalize, state]);

	useEffect(() => {
		if (skipNextDebounceRef.current) {
			skipNextDebounceRef.current = false;
			return;
		}
		if (pendingCheckpointRef.current === null) return;

		clearPendingTimer();
		timerRef.current = window.setTimeout(() => {
			if (pendingCheckpointRef.current !== null) {
				commitSnapshot(pendingCheckpointRef.current);
			}
		}, debounceMs);

		return clearPendingTimer;
	}, [state, debounceMs, clearPendingTimer, commitSnapshot]);

	return {
		state,
		setState,
		replaceState,
		undo,
		redo,
		resetHistory,
		flushCheckpoint,
		canUndo: history.past.length > 0,
		canRedo: history.future.length > 0,

		// debug only
		debugHistory: history
	};
};
