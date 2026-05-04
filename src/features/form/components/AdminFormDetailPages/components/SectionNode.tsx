import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import styles from "../EditPage.module.css";

export const SectionNode = ({ data, id, selected }: NodeProps) => {
	const edges = useEdges();

	const sourceCount = edges.filter(edge => edge.source === id).length;
	const targetCount = edges.filter(edge => edge.target === id).length;

	const showSourceHandles = selected && sourceCount <= 0;
	const showTargetHandles = selected && targetCount <= 0;

	return (
		<>
			<div className={`${styles.node} ${styles.section} ${selected ? styles.selected : ""}`}>
				<div>{data.label as string}</div>
			</div>
			<Handle type="target" position={Position.Top} className={`${styles.handler} ${showTargetHandles ? styles.visible : ""}`} />
			<Handle type="source" position={Position.Bottom} className={`${styles.handler} ${showSourceHandles ? styles.visible : ""}`} isConnectable={showSourceHandles} />
		</>
	);
};
