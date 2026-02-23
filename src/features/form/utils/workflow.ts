import type { FormWorkflowConditionRule, FormWorkflowNodeResponse, FormsSection } from "@nycu-sdc/core-system-sdk";
import { FormWorkflowConditionSource } from "@nycu-sdc/core-system-sdk";

export type WorkflowAnswers = Record<string, string>;

const evaluateCondition = (rule: FormWorkflowConditionRule | undefined, answers: WorkflowAnswers): boolean | null => {
	if (!rule?.question || !rule.pattern) return null;

	const rawAnswer = answers[rule.question];
	if (!rawAnswer) return null;

	let regex: RegExp;
	try {
		regex = new RegExp(rule.pattern);
	} catch {
		return null;
	}

	if (rule.source === FormWorkflowConditionSource.CHOICE) {
		const choices = rawAnswer.split(",").filter(Boolean);
		if (choices.length === 0) return null;
		return choices.some(choiceId => regex.test(choiceId));
	}

	return regex.test(rawAnswer);
};

/**
 * Traverse workflow from START using current answers.
 * If a condition cannot be evaluated yet, traversal stops and later nodes stay hidden.
 */
export const resolveVisibleSectionsFromWorkflow = (sections: FormsSection[], workflow: FormWorkflowNodeResponse[] | undefined, answers: WorkflowAnswers): FormsSection[] => {
	if (!workflow || workflow.length === 0) return sections;

	const nodeMap = new Map(workflow.map(node => [node.id, node]));
	const sectionMap = new Map(sections.map(section => [section.id, section]));
	const startNode = workflow.find(node => node.type === "START");
	if (!startNode) return sections;

	const visible: FormsSection[] = [];
	const visibleIds = new Set<string>();
	const visited = new Set<string>();
	let cursor: string | undefined = startNode.id;

	while (cursor && !visited.has(cursor)) {
		visited.add(cursor);
		const node = nodeMap.get(cursor);
		if (!node) break;

		if (node.type === "SECTION") {
			const section = sectionMap.get(node.id);
			if (section && !visibleIds.has(section.id)) {
				visible.push(section);
				visibleIds.add(section.id);
			}
			cursor = node.next;
			continue;
		}

		if (node.type === "CONDITION") {
			const result = evaluateCondition(node.conditionRule, answers);
			if (result === null) break;
			cursor = result ? node.nextTrue : node.nextFalse;
			continue;
		}

		if (node.type === "END") break;
		cursor = node.next;
	}

	return visible;
};
