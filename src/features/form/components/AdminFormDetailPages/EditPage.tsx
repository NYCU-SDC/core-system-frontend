import { Button } from "@/shared/components";
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	BaseEdge,
	ConnectionLineType,
	Controls,
	getStraightPath,
	Panel,
	ReactFlow,
	useInternalNode,
	type Edge,
	type EdgeProps,
	type Node,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import styles from "./EditPage.module.css";
import { ConditionNode } from "./components/ConditionNode";
import { EndNode } from "./components/EndNode";
import { SectionNode } from "./components/SectionNode";
import { StartNode } from "./components/StartNode";
import { getIntersectionPoint } from "./services/nodeUtil";

const CustomEdge = ({ id, source, target, markerEnd }: EdgeProps) => {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty } = getIntersectionPoint(sourceNode, targetNode);

	const [edgePath] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: tx,
		targetY: ty
	});

	return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} className={styles.edge} />;
};

const initNodes: Node[] = [
	{
		id: "1",
		position: { x: 0, y: 0 },
		data: { label: "開始表單" },
		type: "Start"
	},
	{
		id: "2",
		position: { x: 0, y: 100 },
		data: { label: "Condition" },
		type: "Condition"
	},
	{
		id: "3",
		position: { x: 0, y: 100 },
		data: { label: "True branch" },
		type: "Section"
	},
	{
		id: "4",
		position: { x: 0, y: 100 },
		data: { label: "False branch" },
		type: "Section"
	},
	{
		id: "5",
		position: { x: 0, y: 200 },
		data: { label: "結束表單" },
		type: "End"
	}
];

const initEdges: Edge[] = [
	{
		id: "e1-2",
		source: "1",
		target: "2",
		markerEnd: {
			type: "arrow"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge
	},
	{
		id: "e2-3",
		source: "2",
		target: "3",
		markerEnd: {
			type: "arrow"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge
	},
	{
		id: "e2-4",
		source: "2",
		target: "4",
		markerEnd: {
			type: "arrow"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge
	},
	{
		id: "e3-5",
		source: "3",
		target: "5",
		markerEnd: {
			type: "arrow"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge
	},
	{
		id: "e4-5",
		source: "4",
		target: "5",
		markerEnd: {
			type: "arrow"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge
	}
];

const nodeTypes = {
	Start: StartNode,
	Section: SectionNode,
	Condition: ConditionNode,
	End: EndNode
};

const edgeTypes = {
	"custom-edge": CustomEdge
};

export const AdminFormEditPage = () => {
	const [nodes, setNodes] = useState<Node[]>(initNodes);
	const [edges, setEdges] = useState(initEdges);

	const onNodesChange: OnNodesChange = useCallback(
		changes => {
			setNodes(nds => applyNodeChanges(changes, nds));
		},
		[setNodes]
	);

	const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(edgesSnapshot => applyEdgeChanges(changes, edgesSnapshot)), []);
	const onConnect: OnConnect = useCallback(
		params => {
			const newEdge: Edge = {
				id: `e${params.source}-${params.target}`,
				source: params.source,
				target: params.target,
				markerEnd: { type: "arrow" },
				type: "custom-edge",
				style: { strokeWidth: 2 },
				className: styles.edge
			};
			return setEdges(edgesSnapshot => addEdge(newEdge, edgesSnapshot));
		},
		[setEdges]
	);

	return (
		<div style={{ width: "100%", height: "500px" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				connectionLineType={ConnectionLineType.Straight}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				edgeTypes={edgeTypes}
				nodeTypes={nodeTypes}
				fitView
			>
				<Panel position="top-right">
					<Button onClick={() => console.log("Save")}>新增區域</Button>
					<Button onClick={() => console.log("Load")}>新增條件</Button>
				</Panel>
				<Background gap={12} size={1} />
				<Controls className={styles.controls} />
			</ReactFlow>
		</div>
	);
};
