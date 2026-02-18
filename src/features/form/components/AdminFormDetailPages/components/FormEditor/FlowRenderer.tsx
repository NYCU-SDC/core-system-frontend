import { Button, Popover, Select } from "@/shared/components";
import type { FormWorkflowConditionRule, FormsListSectionsResponse } from "@nycu-sdc/core-system-sdk";
import { FormWorkflowConditionSource } from "@nycu-sdc/core-system-sdk";
import { useMemo, useState } from "react";
import type { NodeItem } from "../../types/workflow";
import { Arrow } from "./Arrow";
import styles from "./FlowRenderer.module.css";

/** Question types whose answers are choice IDs (use CHOICE source in conditionRule) */
const CHOICE_QUESTION_TYPES = new Set(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"]);

export interface FlowRendererProps {
	nodes: NodeItem[];
	/** Sections data (from useSections) — used to populate condition rule dropdowns */
	sections?: FormsListSectionsResponse[];
	/** Called when a node's data changes (label / title / description / conditionRule) */
	onNodeChange: (id: string, updates: Partial<NodeItem>) => void;
	onAddSection: (id: string) => void;
	onDeleteSection: (id: string) => void;
	onAddCondition: (id: string) => void;
	onAddTrueSection: (id: string) => void;
	onAddFalseSection: (id: string) => void;
	onAddTrueCondition: (id: string) => void;
	onAddFalseCondition: (id: string) => void;
	onAddMergeSection: (id: string) => void;
	onAddMergeCondition: (id: string) => void;
}

export const FlowRenderer = ({
	nodes,
	sections,
	onNodeChange,
	onAddSection,
	onDeleteSection,
	onAddCondition,
	onAddTrueSection,
	onAddFalseSection,
	onAddTrueCondition,
	onAddFalseCondition,
	onAddMergeSection,
	onAddMergeCondition
}: FlowRendererProps) => {
	const nodeMap = useMemo(() => {
		return nodes.reduce(
			(map, node) => {
				map[node.id] = node;
				return map;
			},
			{} as Record<string, NodeItem>
		);
	}, [nodes]);

	const renderedIds = new Set<string>();

	const renderNode = (id: string, stopId: string | null = null): React.ReactNode => {
		const node = nodeMap[id];

		if (!node || renderedIds.has(id) || (stopId && id === stopId)) {
			return null;
		}

		renderedIds.add(id);

		return (
			<div className={styles.conditionWrapper}>
				<FlowNode
					key={node.id}
					node={node}
					sections={sections}
					onNodeChange={onNodeChange}
					onAddSection={() => onAddSection(node.id)}
					onDeleteSection={() => onDeleteSection(node.id)}
					onAddCondition={() => onAddCondition(node.id)}
					onAddTrueSection={() => onAddTrueSection(node.id)}
					onAddFalseSection={() => onAddFalseSection(node.id)}
					onAddTrueCondition={() => onAddTrueCondition(node.id)}
					onAddFalseCondition={() => onAddFalseCondition(node.id)}
					onAddMergeSection={() => onAddMergeSection(node.id)}
					onAddMergeCondition={() => onAddMergeCondition(node.id)}
				/>
				{!node.next && node.nextFalse && node.nextTrue && (
					<>
						<div className={styles.branchContainer}>
							<div className={styles.branchColumn}>
								<Arrow type="fail" className={`${styles.arrow} ${styles.falseArrow}`} line={node.type !== "CONDITION" ? "dashed" : "solid"} />
								{node.nextFalse && renderNode(node.nextFalse, node.mergeId)}
							</div>
							<div className={styles.branchColumn}>
								<Arrow type="success" className={styles.arrow} line={node.type !== "CONDITION" ? "dashed" : "solid"} />
								{node.nextTrue && renderNode(node.nextTrue, node.mergeId)}
							</div>
						</div>
						{node.mergeId && renderNode(node.mergeId, stopId)}
					</>
				)}
				{node.next && (
					<>
						<Arrow className={styles.arrow} />
						{node.next !== stopId && renderNode(node.next, stopId)}
					</>
				)}
			</div>
		);
	};

	if (!nodes || nodes.length === 0) {
		return <div>載入中...</div>;
	}

	return <div className={styles.container}>{renderNode(nodes[0].id)}</div>;
};

interface FlowNodeProps {
	node: NodeItem;
	sections?: FormsListSectionsResponse[];
	onNodeChange: (id: string, updates: Partial<NodeItem>) => void;
	onAddSection: () => void;
	onDeleteSection: () => void;
	onAddCondition: () => void;
	onAddTrueSection: () => void;
	onAddFalseSection: () => void;
	onAddTrueCondition: () => void;
	onAddFalseCondition: () => void;
	onAddMergeSection: () => void;
	onAddMergeCondition: () => void;
}

const FlowNode = ({
	node,
	sections,
	onNodeChange,
	onAddSection,
	onDeleteSection,
	onAddCondition,
	onAddTrueSection,
	onAddFalseSection,
	onAddTrueCondition,
	onAddFalseCondition,
	onAddMergeSection,
	onAddMergeCondition
}: FlowNodeProps) => {
	// ── SECTION editing state ─────────────────────────────────────────────────
	const [isEditing, setIsEditing] = useState(false);
	const [draftLabel, setDraftLabel] = useState(node.label);
	const [draftTitle, setDraftTitle] = useState(node.title ?? "");
	const [draftDesc, setDraftDesc] = useState(node.description ?? "");

	// Sync drafts when parent updates the node (e.g., after workflow save + refetch)
	// Using derived state pattern to avoid cascading renders from useEffect setState
	const [prevNodeLabel, setPrevNodeLabel] = useState(node.label);
	const [prevNodeTitle, setPrevNodeTitle] = useState(node.title);
	const [prevNodeDesc, setPrevNodeDesc] = useState(node.description);
	if (node.label !== prevNodeLabel) {
		setDraftLabel(node.label);
		setPrevNodeLabel(node.label);
	}
	if (node.title !== prevNodeTitle) {
		setDraftTitle(node.title ?? "");
		setPrevNodeTitle(node.title);
	}
	if (node.description !== prevNodeDesc) {
		setDraftDesc(node.description ?? "");
		setPrevNodeDesc(node.description);
	}

	const handleSaveEdit = () => {
		onNodeChange(node.id, {
			label: draftLabel.trim() || node.label,
			title: draftTitle.trim() || undefined,
			description: draftDesc.trim() || undefined
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setDraftLabel(node.label);
		setDraftTitle(node.title ?? "");
		setDraftDesc(node.description ?? "");
		setIsEditing(false);
	};

	// ── Condition rule data ───────────────────────────────────────────────────
	const allQuestions = useMemo(() => {
		if (!sections) return [];
		return sections.flatMap(sr => sr.sections.flatMap(s => s.questions.map(q => ({ ...q, sectionTitle: s.title }))));
	}, [sections]);

	const selectedQuestion = useMemo(() => allQuestions.find(q => q.id === node.conditionRule?.question), [allQuestions, node.conditionRule?.question]);

	const isChoiceQuestion = selectedQuestion ? CHOICE_QUESTION_TYPES.has(selectedQuestion.type) : false;

	// Extract choiceId from a "^{uuid}$" pattern
	const selectedChoiceId = useMemo(() => {
		const p = node.conditionRule?.pattern ?? "";
		const m = p.match(/^\^([0-9a-f-]+)\$$/i);
		return m ? m[1] : "";
	}, [node.conditionRule?.pattern]);

	const handleQuestionChange = (questionId: string) => {
		const q = allQuestions.find(q => q.id === questionId);
		const isChoice = q ? CHOICE_QUESTION_TYPES.has(q.type) : false;
		onNodeChange(node.id, {
			conditionRule: {
				source: isChoice ? FormWorkflowConditionSource.CHOICE : FormWorkflowConditionSource.NON_CHOICE,
				question: questionId,
				pattern: ""
			} as FormWorkflowConditionRule
		});
	};

	const handleChoiceChange = (choiceId: string) => {
		if (!node.conditionRule) return;
		onNodeChange(node.id, {
			conditionRule: { ...node.conditionRule, source: FormWorkflowConditionSource.CHOICE, pattern: `^${choiceId}$` }
		});
	};

	const handlePatternChange = (pattern: string) => {
		if (!node.conditionRule) return;
		onNodeChange(node.id, { conditionRule: { ...node.conditionRule, pattern } });
	};

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<Popover
			side="right"
			content={close => {
				return (
					<div className={styles.popoverContent}>
						{node.type === "SECTION" && (
							<Button
								variant="secondary"
								onClick={() => {
									setIsEditing(true);
									close();
								}}
							>
								編輯
							</Button>
						)}
						{node.type !== "END" && node.type !== "CONDITION" && (
							<Button
								variant="secondary"
								onClick={() => {
									onAddSection();
									close();
								}}
							>
								新增區域
							</Button>
						)}
						{node.type !== "CONDITION" && node.type !== "END" && (
							<Button
								variant="secondary"
								onClick={() => {
									onAddCondition();
									close();
								}}
							>
								新增條件
							</Button>
						)}
						{node.type === "CONDITION" && (
							<>
								<Popover
									side="bottom"
									content={innerClose => {
										return (
											<div className={styles.popoverContent}>
												<Button
													variant="secondary"
													onClick={() => {
														onAddMergeSection();
														innerClose();
														close();
													}}
												>
													區域
												</Button>
												<Button
													variant="secondary"
													onClick={() => {
														onAddMergeCondition();
														innerClose();
														close();
													}}
												>
													條件
												</Button>
											</div>
										);
									}}
								>
									<Button variant="secondary">新增合併點</Button>
								</Popover>
								<Popover
									side="bottom"
									content={innerClose => {
										return (
											<div className={styles.popoverContent}>
												<Button
													variant="secondary"
													onClick={() => {
														onAddTrueSection();
														innerClose();
														close();
													}}
												>
													區域
												</Button>
												<Button
													variant="secondary"
													onClick={() => {
														onAddTrueCondition();
														innerClose();
														close();
													}}
												>
													條件
												</Button>
											</div>
										);
									}}
								>
									<Button variant="secondary">新增成功</Button>
								</Popover>
								<Popover
									side="bottom"
									content={innerClose => {
										return (
											<div className={styles.popoverContent}>
												<Button
													variant="secondary"
													onClick={() => {
														onAddFalseSection();
														innerClose();
														close();
													}}
												>
													區域
												</Button>
												<Button
													variant="secondary"
													onClick={() => {
														onAddFalseCondition();
														innerClose();
														close();
													}}
												>
													條件
												</Button>
											</div>
										);
									}}
								>
									<Button variant="secondary">新增失敗</Button>
								</Popover>
							</>
						)}
						{node.type !== "START" && node.type !== "END" && (
							<Button
								variant="secondary"
								onClick={() => {
									onDeleteSection();
									close();
								}}
							>
								刪除
							</Button>
						)}
					</div>
				);
			}}
		>
			<div className={`${styles.node} ${styles[node.type.toLowerCase()]} ${node.isMergeNode ? styles.mergeNode : ""}`}>
				{/* ── START / END / SECTION: label display or inline edit form ── */}
				{node.type !== "CONDITION" && !isEditing && (
					<div className={styles.nodeContent}>
						<p className={styles.nodeLabel}>{node.label}</p>
						{node.type === "SECTION" && node.title && <p className={styles.nodeTitle}>{node.title}</p>}
					</div>
				)}

				{node.type !== "CONDITION" && isEditing && (
					<div className={styles.editForm} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
						<input className={styles.editInput} value={draftLabel} onChange={e => setDraftLabel(e.target.value)} placeholder="節點標籤（內部使用）" autoFocus />
						<input className={styles.editInput} value={draftTitle} onChange={e => setDraftTitle(e.target.value)} placeholder="Section 標題（受訪者可見）" />
						<input className={styles.editInput} value={draftDesc} onChange={e => setDraftDesc(e.target.value)} placeholder="Section 說明（受訪者可見）" />
						<div className={styles.editActions}>
							<Button onClick={handleSaveEdit}>儲存</Button>
							<Button variant="secondary" onClick={handleCancelEdit}>
								取消
							</Button>
						</div>
					</div>
				)}

				{/* ── CONDITION: real condition rule editor ── */}
				{node.type === "CONDITION" && (
					<div className={styles.conditionEditor} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
						<p className={styles.text}>如果</p>
						<Select
							options={allQuestions.map(q => ({ value: q.id, label: `${q.sectionTitle} › ${q.title}` }))}
							value={node.conditionRule?.question ?? ""}
							onValueChange={handleQuestionChange}
							placeholder="選擇問題"
							variant="text"
						/>
						{node.conditionRule?.question && isChoiceQuestion && (
							<>
								<p className={styles.text}>選擇</p>
								<Select
									options={(selectedQuestion?.choices ?? []).map(c => ({ value: c.id, label: c.name }))}
									value={selectedChoiceId}
									onValueChange={handleChoiceChange}
									placeholder="選擇答案"
									variant="text"
								/>
							</>
						)}
						{node.conditionRule?.question && !isChoiceQuestion && (
							<>
								<p className={styles.text}>符合</p>
								<input className={styles.editInput} value={node.conditionRule?.pattern ?? ""} onChange={e => handlePatternChange(e.target.value)} placeholder="Regex 模式（如 ^.+$）" />
							</>
						)}
					</div>
				)}
			</div>
		</Popover>
	);
};
