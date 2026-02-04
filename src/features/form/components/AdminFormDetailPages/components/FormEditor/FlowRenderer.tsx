import { Button, Select } from "@/shared/components";
import { Popover } from "@/shared/components/Popover/Popover";
import { useMemo } from "react";
import type { NodeItem } from "../../types/workflow";
import { Arrow } from "./Arrow";
import styles from "./FlowRenderer.module.css";

export interface FlowRendererProps {
	nodes: NodeItem[];
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
	return (
		<Popover
			side="right"
			content={
				<div className={styles.popoverContent}>
					{node.type === "SECTION" && <Button variant="secondary">編輯</Button>}
					{node.type != "END" && node.type != "CONDITION" && (
						<Button variant="secondary" onClick={onAddSection}>
							新增區域
						</Button>
					)}
					{node.type !== "CONDITION" && node.type !== "END" && (
						<Button variant="secondary" onClick={onAddCondition}>
							新增條件
						</Button>
					)}
					{node.type === "CONDITION" && (
						<>
							<Popover
								side="bottom"
								content={
									<div className={styles.popoverContent}>
										<Button variant="secondary" onClick={onAddMergeSection}>
											區域
										</Button>
										<Button variant="secondary" onClick={onAddMergeCondition}>
											條件
										</Button>
									</div>
								}
							>
								<Button variant="secondary">新增合併點</Button>
							</Popover>
							<Popover
								side="bottom"
								content={
									<div className={styles.popoverContent}>
										<Button variant="secondary" onClick={onAddTrueSection}>
											區域
										</Button>
										<Button variant="secondary" onClick={onAddTrueCondition}>
											條件
										</Button>
									</div>
								}
							>
								<Button variant="secondary">新增成功</Button>
							</Popover>
							<Popover
								side="bottom"
								content={
									<div className={styles.popoverContent}>
										<Button variant="secondary" onClick={onAddFalseSection}>
											區域
										</Button>
										<Button variant="secondary" onClick={onAddFalseCondition}>
											條件
										</Button>
									</div>
								}
							>
								<Button variant="secondary">新增失敗</Button>
							</Popover>
						</>
					)}
					{node.type !== "START" && node.type !== "END" && (
						<Button variant="secondary" onClick={onDeleteSection}>
							刪除
						</Button>
					)}
				</div>
			}
		>
			<div className={`${styles.node} ${styles[node.type.toLowerCase()]} ${styles[node.isMergeNode ? "mergeNode" : ""]}`}>
				{node.type === "CONDITION" && (
					<>
						<p className={styles.text}>如果</p>
						<Select options={[{ value: "section1", label: "區塊 1" }]} placeholder="選擇區塊" variant="text" />
						<Select options={[{ value: "question1", label: "問題 1" }]} placeholder="選擇問題" variant="text" />
						<p className={styles.text}>選擇</p>
						<Select options={[{ value: "answer1", label: "答案 1" }]} placeholder="選擇答案" variant="text" />
					</>
				)}
				{node.type !== "CONDITION" && <p>{node.label}</p>}
			</div>
		</Popover>
	);
};
