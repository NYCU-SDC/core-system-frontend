import type { FormWorkflowConditionRule, FormWorkflowNodePayload } from "@nycu-sdc/core-system-sdk";

export type NodeItem = {
	id: string;
	type: "START" | "END" | "SECTION" | "CONDITION";
	/** Internal editor label (not shown to respondents) */
	label: string;
	payload: FormWorkflowNodePayload;
	/** Condition rule (CONDITION nodes only) */
	conditionRule?: FormWorkflowConditionRule;
	next?: string;
	nextTrue?: string;
	nextFalse?: string;
};

export type ChoiceQuestionType = "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN";

type QuestionWithSection = FormsQuestionResponse & { sectionTitle: string };

type WorkflowNodeData = {
	label: string;
	raw: NodeItem;
	questions: QuestionWithSection[];
	onUpdateCondition?: (nodeId: string, data: FormWorkflowConditionRule) => void;
	onUpdateChoice?: (nodeId: string, choiceId: string) => void;
};

export type AppNode = Node<WorkflowNodeData>;
