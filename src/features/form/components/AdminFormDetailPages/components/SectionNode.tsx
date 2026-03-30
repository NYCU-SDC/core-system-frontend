import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import styles from "../EditPage.module.css";

export const SectionNode = ({ data, id }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [selected, setSelected] = useState(false);
	const edges = useEdges();

	const sourceCount = edges.filter(edge => edge.source === id).length;
	const targetCount = edges.filter(edge => edge.target === id).length;

	const showSourceHandles = (isHovered || selected) && sourceCount <= 0;
	const showTargetHandles = (isHovered || selected) && targetCount <= 0;

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => setSelected(prev => !prev)}
			className={`${styles.node} ${styles.section} ${selected ? styles.selected : ""}`}
		>
			<div>{data.label as string}</div>

			<Handle type="target" position={Position.Top} className={`${styles.handler} ${showTargetHandles ? styles.visible : ""}`} isConnectable={showTargetHandles} />
			<Handle type="source" position={Position.Bottom} className={`${styles.handler} ${showSourceHandles ? styles.visible : ""}`} isConnectable={showSourceHandles} />
		</div>
	);
};
