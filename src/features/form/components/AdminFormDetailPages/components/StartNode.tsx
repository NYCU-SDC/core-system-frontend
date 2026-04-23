import { Handle, Position, useEdges, useReactFlow, type NodeProps } from "@xyflow/react";
import { useEffect } from "react";
import styles from "../EditPage.module.css";

export const StartNode = ({ data, id, selected }: NodeProps) => {
	const edges = useEdges();
	const { updateNode } = useReactFlow();

	useEffect(() => {
		updateNode(id, { deletable: false });
	}, [id, updateNode]);

	const sourceCount = edges.filter(edge => edge.source === id).length;

	const showHandles = selected && sourceCount <= 0;

	return (
		<>
			<div className={`${styles.node} ${styles.flow} ${selected ? styles.selected : ""}`}>
				<div>{data.label as string}</div>
			</div>
			<Handle type="source" position={Position.Bottom} className={`${styles.handler} ${showHandles ? styles.visible : ""}`} isConnectable={showHandles} />
		</>
	);
};
