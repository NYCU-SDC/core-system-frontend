import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import styles from "../EditPage.module.css";

export const StartNode = ({ data, id }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [selected, setSelected] = useState(false);
	const edges = useEdges();

	const sourceCount = edges.filter(edge => edge.source === id).length;

	const showHandles = (isHovered || selected) && sourceCount <= 0;

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => setSelected(prev => !prev)}
			className={`${styles.node} ${styles.flow} ${selected ? styles.selected : ""}`}
		>
			<div>{data.label as string}</div>

			<Handle type="source" position={Position.Bottom} className={`${styles.handler} ${showHandles ? styles.visible : ""}`} isConnectable={showHandles} />
		</div>
	);
};
