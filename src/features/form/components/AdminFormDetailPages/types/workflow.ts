export type NodeItem = {
	id: string;
	type: "START" | "END" | "SECTION" | "CONDITION";
	label: string;
	next?: string;
	nextTrue?: string;
	nextFalse?: string;
	isMergeNode?: boolean;
	mergeId?: string;
};
