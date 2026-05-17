import { Handle, Position, useEdges, useReactFlow, type NodeProps } from "@xyflow/react";
import { useEffect } from "react";
import styles from "../EditPage.module.css";

export const EndNode = ({ data, id, selected }: NodeProps) => {
	const edges = useEdges();
	const { updateNode } = useReactFlow();

	useEffect(() => {
		updateNode(id, { deletable: false });
	}, [id, updateNode]);

	const edgeCount = edges.filter(edge => edge.target === id).length;

	const showHandles = selected && edgeCount <= 0;

	return (
		<>
			<div className={`${styles.node} ${styles.flow} ${selected ? styles.selected : ""}`}>
				<div>{data.label as string}</div>
			</div>
			<Handle type="target" position={Position.Top} className={`${styles.handler} ${showHandles ? styles.visible : ""}`} />
		</>
	);
};
