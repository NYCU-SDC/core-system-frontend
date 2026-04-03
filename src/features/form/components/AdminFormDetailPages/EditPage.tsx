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
import { v4 as uuidv4 } from "uuid";
import styles from "./EditPage.module.css";
import type { NodeItem } from "./types/workflow";

interface AdminFormEditPageProps {
	formData: FormsFormResponse;
}

const toApiNodes = (nodes: NodeItem[]): FormWorkflowNodeRequest[] =>
	nodes.map(n => ({
		id: n.id,
		label: n.label,
		payload: n.payload,
		...(n.conditionRule !== undefined && { conditionRule: n.conditionRule }),
		...(n.next !== undefined && { next: n.next }),
		...(n.nextTrue !== undefined && { nextTrue: n.nextTrue }),
		...(n.nextFalse !== undefined && { nextFalse: n.nextFalse })
	}));

const getPath = (startId: string, nodeMap: Map<string, NodeItem>): string[] => {
	const path: string[] = [];
	let currentId: string | undefined = startId;
	while (currentId) {
		path.push(currentId);
		const nextNode = nodeMap.get(currentId);
		if (!nextNode) break;
		const mergeId = findMergeNodeId(nextNode, nodeMap);
		currentId = nextNode?.next || mergeId || undefined;
	}
	return path;
};

const findMergeNodeId = (node: NodeItem, nodeMap: Map<string, NodeItem>): string | null => {
	if (!node.nextTrue || !node.nextFalse) return null;

	const truePath = getPath(node.nextTrue, nodeMap);
	const falsePath = getPath(node.nextFalse, nodeMap);

	for (const id of truePath) {
		if (falsePath.includes(id)) {
			return id;
		}
	}

	return null;
};

const CustomEdge = ({ id, source, target, markerEnd, data }: EdgeProps) => {
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
			type: "arrow",
			color: "var(--foreground)"
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
		sourceHandle: "true",
		target: "3",
		markerEnd: {
			type: "arrow",
			color: "var(--green)"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge,
		data: {
			condition: "true"
		}
	},
	{
		id: "e2-4",
		source: "2",
		sourceHandle: "false",
		target: "4",
		markerEnd: {
			type: "arrow",
			color: "var(--pink)"
		},
		type: "custom-edge",
		style: {
			strokeWidth: 2
		},
		className: styles.edge,
		data: {
			condition: "false"
		}
	},
	{
		id: "e3-5",
		source: "3",
		target: "5",
		markerEnd: {
			type: "arrow",
			color: "var(--foreground)"
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
			type: "arrow",
			color: "var(--foreground)"
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
			const edgeData = { condition: "" };
			let arrowColor = "var(--foreground)";
			if (params.sourceHandle === "true") {
				edgeData.condition = "true";
				arrowColor = "var(--green)";
			}
			if (params.sourceHandle === "false") {
				edgeData.condition = "false";
				arrowColor = "var(--pink)";
			}
			const newEdge: Edge = {
				id: `e${params.source}-${params.target}`,
				source: params.source,
				sourceHandle: params.sourceHandle,
				target: params.target,
				markerEnd: { type: "arrow", color: arrowColor },
				type: "custom-edge",
				style: { strokeWidth: 2 },
				className: styles.edge,
				data: edgeData
			};
			return setEdges(edgesSnapshot => addEdge(newEdge, edgesSnapshot));
		},
		[setEdges]
	);

	const handleAddNode = (type: string) => {
		const newNode: Node = {
			id: uuidv4(),
			position: { x: 0, y: 0 },
			data: { label: `${type} ${nodes.length + 1}` },
			type
		};
		setNodes(nds => [...nds, newNode]);
	};

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
					<Button onClick={() => handleAddNode("Section")}>新增區域</Button>
					<Button onClick={() => handleAddNode("Condition")}>新增條件</Button>
				</Panel>
				<Background gap={12} size={1} />
				<Controls className={styles.controls} />
			</ReactFlow>
		</div>
	);
};
