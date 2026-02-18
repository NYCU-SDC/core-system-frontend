import type { FormWorkflowConditionRule } from "@nycu-sdc/core-system-sdk";

export type NodeItem = {
	id: string;
	type: "START" | "END" | "SECTION" | "CONDITION";
	/** Internal editor label (not shown to respondents) */
	label: string;
	/** Section title shown to respondents (SECTION nodes only) */
	title?: string;
	/** Section description shown to respondents (SECTION nodes only) */
	description?: string;
	/** Condition rule (CONDITION nodes only) */
	conditionRule?: FormWorkflowConditionRule;
	next?: string;
	nextTrue?: string;
	nextFalse?: string;
	isMergeNode?: boolean;
	mergeId?: string;
};
