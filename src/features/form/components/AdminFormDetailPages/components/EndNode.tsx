import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import styles from "../EditPage.module.css";

export const EndNode = ({ data, id }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [selected, setSelected] = useState(false);

	const edges = useEdges();
	const edgeCount = edges.filter(edge => edge.target === id).length;

	const showHandles = (isHovered || selected) && edgeCount <= 0;

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => setSelected(prev => !prev)}
			className={`${styles.node} ${styles.flow} ${selected ? styles.selected : ""}`}
		>
			<div>{data.label as string}</div>
			<Handle type="target" position={Position.Top} className={`${styles.handler} ${showHandles ? styles.visible : ""}`} isConnectable={showHandles} />
		</div>
	);
};
