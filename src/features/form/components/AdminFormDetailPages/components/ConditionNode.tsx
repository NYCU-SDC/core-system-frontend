import { Select } from "@/shared/components";
import { FormWorkflowConditionSource } from "@nycu-sdc/core-system-sdk";
import { Handle, type NodeProps, Position, useEdges } from "@xyflow/react";
import { useEffect } from "react";
import styles from "../EditPage.module.css";
import type { AppNode } from "../types/workflow";

export const ConditionNode = ({ data, id, selected }: NodeProps<AppNode>) => {
	const edges = useEdges();
	const targetCount = edges.filter(edge => edge.target === id).length;

	const CHOICE_QUESTION_TYPES = new Set(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"]);

	const showTrueSourceHandler = selected && !edges.some(edge => edge.source === id && edge.sourceHandle === "true");
	const showFalseSourceHandler = selected && !edges.some(edge => edge.source === id && edge.sourceHandle === "false");
	const showTargetHandles = selected && targetCount <= 0;

	const currentQuestionId = data.raw.conditionRule?.question ?? "";
	const isValidSelection = currentQuestionId === "" || (data.questions && data.questions.some(q => q.id === currentQuestionId));
	const isChoiceQuestion = currentQuestionId
		? data.questions?.find(q => q.id === currentQuestionId)?.type && CHOICE_QUESTION_TYPES.has(data.questions.find(q => q.id === currentQuestionId)?.type!)
		: false;

	useEffect(() => {
		if (currentQuestionId && !isValidSelection && data.onUpdateCondition) {
			data.onUpdateCondition(id, {
				question: "",
				source: FormWorkflowConditionSource.CHOICE,
				pattern: ""
			});
		}
	}, [currentQuestionId, isValidSelection, id, data]);

	const handleQuestionChange = (questionId: string) => {
		if (data.onUpdateCondition) {
			data.onUpdateCondition(id, {
				question: questionId,
				source: isChoiceQuestion ? FormWorkflowConditionSource.CHOICE : FormWorkflowConditionSource.NON_CHOICE,
				pattern: ""
			});
		}
	};

	const handleChoiceChange = (choiceId: string) => {
		if (data.onUpdateChoice) {
			data.onUpdateChoice(id, choiceId);
		}
	};

	return (
		<>
			<div className={`${styles.node} ${styles.condition} ${selected ? styles.selected : ""}`}>
				<p className={styles.text}>如果</p>
				<Select
					options={data.questions?.map(q => ({ value: q.id, label: `${q.sectionTitle} › ${q.title}` })) || []}
					value={isValidSelection ? currentQuestionId : ""}
					onValueChange={handleQuestionChange}
					placeholder="選擇問題"
					variant="text"
				/>
				{data.raw.conditionRule?.question && isChoiceQuestion && (
					<>
						<p className={styles.text}>選擇</p>
						<Select
							options={(data.questions?.find(q => q.id === currentQuestionId)?.choices ?? []).map(c => ({ value: c.id, label: c.name }))}
							value={data.raw.conditionRule?.pattern ?? ""}
							onValueChange={handleChoiceChange}
							placeholder="選擇答案"
							variant="text"
						/>
					</>
				)}
			</div>
			<Handle type="target" position={Position.Top} className={`${styles.handler} ${showTargetHandles ? styles.visible : ""}`} />
			<Handle
				type="source"
				position={Position.Bottom}
				id="true"
				className={`${styles.handler} ${styles.conditionHandler} ${styles.handlerTrue} ${showTrueSourceHandler ? styles.visible : ""}`}
				isConnectable={showTrueSourceHandler}
			>
				<svg viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1" className={styles.icon}>
					<circle cx="8" cy="8" r="4" strokeDasharray="1 1" />
					<path d="M6 8l1 1 3-3" />
				</svg>
			</Handle>
			<Handle
				type="source"
				position={Position.Bottom}
				id="false"
				className={`${styles.handler} ${styles.conditionHandler} ${styles.handlerFalse} ${showFalseSourceHandler ? styles.visible : ""}`}
				isConnectable={showFalseSourceHandler}
			>
				<svg viewBox="0 0 16 16" fill="none" stroke="#ec4899" strokeWidth="1" className={styles.icon}>
					<circle cx="8" cy="8" r="4" strokeDasharray="1 1" />
					<path d="M6 6l4 4M10 6l-4 4" />
				</svg>
			</Handle>
		</>
	);
};
