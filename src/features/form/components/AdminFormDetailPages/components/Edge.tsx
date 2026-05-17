import styles from "@/features/form/components/AdminFormDetailPages/EditPage.module.css";
import { getIntersectionPoint } from "@/features/form/components/AdminFormDetailPages/services/nodeUtil";
import { BaseEdge, type EdgeProps, getStraightPath, useInternalNode } from "@xyflow/react";

export const CustomEdge = ({ id, source, target, markerEnd, data }: EdgeProps) => {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const condition = data?.condition || "";

	const { sx, sy, tx, ty } = getIntersectionPoint(sourceNode, targetNode);

	const [edgePath] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: tx,
		targetY: ty
	});

	return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} className={`${styles.edge} ${condition === "true" ? styles.trueBranch : condition === "false" ? styles.falseBranch : ""}`} />;
};
