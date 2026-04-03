import { Handle, type NodeProps, Position, useEdges } from "@xyflow/react";
import styles from "../EditPage.module.css";

export const ConditionNode = ({ data, id, selected }: NodeProps) => {
	const edges = useEdges();
	const targetCount = edges.filter(edge => edge.target === id).length;

	const showTrueSourceHandler = selected && !edges.some(edge => edge.source === id && edge.sourceHandle === "true");
	const showFalseSourceHandler = selected && !edges.some(edge => edge.source === id && edge.sourceHandle === "false");
	const showTargetHandles = selected && targetCount <= 0;

	return (
		<>
			<div className={`${styles.node} ${styles.condition} ${selected ? styles.selected : ""}`}>
				<div>{data.label as string}</div>
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
