import { useSections } from "@/features/form/hooks/useSections";
import { useCreateWorkflowNode, useDeleteWorkflowNode, useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, LoadingSpinner } from "@/shared/components";
import type { FormsForm, FormWorkflowCreateNodeRequest, FormWorkflowNodeResponse } from "@nycu-sdc/core-system-sdk";
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	ConnectionLineType,
	Controls,
	Panel,
	ReactFlow,
	useReactFlow,
	type Edge,
	type Node,
	type NodeMouseHandler,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditPage.module.css";
import { ConditionNode } from "./components/ConditionNode";
import { CustomEdge } from "./components/Edge";
import { EndNode } from "./components/EndNode";
import { SectionNode } from "./components/SectionNode";
import { StartNode } from "./components/StartNode";
import type { AppNode, NodeItem } from "./types/workflow";

const nodeTypes = {
	START: StartNode,
	SECTION: SectionNode,
	CONDITION: ConditionNode,
	END: EndNode
};

const edgeTypes = {
	"custom-edge": CustomEdge
};

interface AdminFormEditPageProps {
	formData: FormsForm;
}

export const AdminFormEditPage = ({ formData }: AdminFormEditPageProps) => {
	const [nodes, setNodes] = useState<AppNode[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);

	const isInitialized = useRef(false);
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const deletingNodeIds = useRef<Set<string>>(new Set());

	const navigate = useNavigate();
	const { orgSlug } = useParams();

	// Data
	const workflowQuery = useWorkflow(formData.id);
	const sectionsQuery = useSections(formData.id);
	const updatedWorkflowMutation = useUpdateWorkflow(formData.id);
	const createWorkflowNodeMutation = useCreateWorkflowNode(formData.id);
	const deleteWorkflowNodeMutation = useDeleteWorkflowNode(formData.id);

	// React Flow
	const { getViewport, getNodes, getEdges } = useReactFlow();

	const updateWorkflow = useCallback(
		(currentNodes: Node[], currentEdges: Edge[]) => {
			const updatePayload = currentNodes.map(node => {
				const raw = node.data.raw as FormWorkflowNodeResponse;

				const outgoingEdges = currentEdges.filter(e => e.source === node.id);

				return {
					...raw,
					id: node.id,
					payload: { x: node.position.x, y: node.position.y },
					next: outgoingEdges.find(e => !e.sourceHandle)?.target,
					nextTrue: outgoingEdges.find(e => e.sourceHandle === "true")?.target,
					nextFalse: outgoingEdges.find(e => e.sourceHandle === "false")?.target
				};
			});

			updatedWorkflowMutation.mutate(updatePayload);
		},
		[updatedWorkflowMutation]
	);

	const deleteNode = useCallback(
		(nodeId: string) => {
			deletingNodeIds.current.add(nodeId);

			deleteWorkflowNodeMutation.mutate(nodeId, {
				onSuccess: () => {
					workflowQuery.refetch();
					sectionsQuery.refetch();
				}
			});
		},
		[deleteWorkflowNodeMutation, workflowQuery]
	);

	const handleAddNode = useCallback(
		(type: NodeItem["type"]) => {
			if (!reactFlowWrapper.current) return;

			const { x, y, zoom } = getViewport();
			const width = reactFlowWrapper.current.offsetWidth;
			const height = reactFlowWrapper.current.offsetHeight;

			const centerX = (width / 2 - x) / zoom;
			const centerY = (height / 2 - y) / zoom;

			createWorkflowNodeMutation.mutate(
				{
					type: type as FormWorkflowCreateNodeRequest["type"],
					payload: { x: centerX, y: centerY }
				},
				{
					onSuccess: () => {
						workflowQuery.refetch();
						sectionsQuery.refetch();
					},
					onError: error => {
						console.error("新增節點失敗:", error);
					}
				}
			);
		},
		[createWorkflowNodeMutation, workflowQuery]
	);

	const handleConditionSelectedChange = useCallback(
		(nodeId: string, conditionRule: FormWorkflowNodeResponse["conditionRule"]) => {
			const currentNodes = getNodes() as AppNode[];
			const currentEdges = getEdges();

			const targetNode = currentNodes.find(n => n.id === nodeId);
			if (!targetNode) {
				return;
			}

			const updatedNode: AppNode = {
				...targetNode,
				data: {
					...targetNode.data,
					raw: {
						...(targetNode.data.raw as FormWorkflowNodeResponse),
						conditionRule: conditionRule
					}
				}
			};

			const nextNodes = currentNodes.map(n => (n.id === nodeId ? updatedNode : n));

			console.log("更新後的節點資料:", nextNodes);

			setNodes(nextNodes);

			updateWorkflow(nextNodes, currentEdges);
		},
		[getNodes, getEdges, updateWorkflow]
	);

	const handleChoiceChange = useCallback(
		(nodeId: string, choiceId: string) => {
			const currentNodes = getNodes() as AppNode[];
			const currentEdges = getEdges();
			const targetNode = currentNodes.find(n => n.id === nodeId);
			if (!targetNode) {
				return;
			}

			const updatedNode: AppNode = {
				...targetNode,
				data: {
					...targetNode.data,
					raw: {
						...(targetNode.data.raw as FormWorkflowNodeResponse),
						conditionRule: {
							...(targetNode.data.raw as FormWorkflowNodeResponse).conditionRule,
							pattern: choiceId
						}
					}
				}
			};

			const nextNodes = currentNodes.map(n => (n.id === nodeId ? updatedNode : n));

			setNodes(nextNodes);
			updateWorkflow(nextNodes, currentEdges);
		},
		[getNodes, getEdges, updateWorkflow]
	);

	// Effect
	useEffect(() => {
		isInitialized.current = false;
	}, [formData.id]);

	useEffect(() => {
		if (!workflowQuery.data) return;
		if (!sectionsQuery.data) return;

		const allQuestions = sectionsQuery.data.flatMap(sb => sb.questions?.map(q => ({ ...q, sectionTitle: sb.section.title })) || []) || [];
		console.log("所有問題資料:", allQuestions);

		const serverWorkflow = workflowQuery.data.workflow;

		if (!isInitialized.current) {
			const initialNodes = serverWorkflow.map(node => ({
				id: node.id,
				type: node.type as AppNode["type"],
				position: { x: node.payload?.x ?? 0, y: node.payload?.y ?? 0 },
				data: { label: node.label, raw: node, questions: allQuestions, onUpdateCondition: handleConditionSelectedChange, onUpdateChoice: handleChoiceChange }
			}));

			setNodes(initialNodes);
			setEdges(generateEdgesFromData(serverWorkflow));
			isInitialized.current = true;
			return;
		}

		setNodes(prevNodes => {
			const serverNodeIds = new Set(serverWorkflow.map(n => n.id));
			const prevNodeIds = new Set(prevNodes.map(n => n.id));

			let hasChanges = false;
			const nextNodes: AppNode[] = [];

			prevNodes.forEach(n => {
				if (!serverNodeIds.has(n.id)) {
					hasChanges = true;
					return;
				}

				const serverNode = serverWorkflow.find(sn => sn.id === n.id)!;

				const isQuestionsChanged = JSON.stringify(n.data.questions) !== JSON.stringify(allQuestions);

				if (serverNode.label !== n.data.label || isQuestionsChanged) {
					hasChanges = true;
					nextNodes.push({
						...n,
						data: {
							...n.data,
							label: serverNode.label,
							raw: serverNode,
							questions: allQuestions,
							onUpdateCondition: handleConditionSelectedChange,
							onUpdateChoice: handleChoiceChange
						}
					});
				} else {
					nextNodes.push(n);
				}
			});

			const newNodes = serverWorkflow
				.filter(n => !prevNodeIds.has(n.id) && !deletingNodeIds.current.has(n.id))
				.map(node => {
					hasChanges = true;
					return {
						id: node.id,
						type: node.type as AppNode["type"],
						position: { x: node.payload?.x ?? 100, y: node.payload?.y ?? 100 },
						data: { label: node.label, raw: node, questions: allQuestions, onUpdateCondition: handleConditionSelectedChange, onUpdateChoice: handleChoiceChange }
					};
				});

			return hasChanges ? [...nextNodes, ...newNodes] : prevNodes;
		});
	}, [workflowQuery.data, sectionsQuery.data, handleConditionSelectedChange, handleChoiceChange]);

	const generateEdgesFromData = (nodes: NodeItem[]): Edge[] => {
		const generatedEdges: Edge[] = [];
		nodes.forEach(node => {
			if (node.type === "CONDITION") {
				if (node.nextTrue) {
					generatedEdges.push({
						id: `e${node.id}-true`,
						source: node.id,
						sourceHandle: "true",
						target: node.nextTrue,
						markerEnd: { type: "arrow", color: "var(--green)" },
						type: "custom-edge",
						style: { strokeWidth: 2 },
						className: styles.edge,
						data: { condition: "true" }
					});
				}
				if (node.nextFalse) {
					generatedEdges.push({
						id: `e${node.id}-false`,
						source: node.id,
						sourceHandle: "false",
						target: node.nextFalse,
						markerEnd: { type: "arrow", color: "var(--pink)" },
						type: "custom-edge",
						style: { strokeWidth: 2 },
						className: styles.edge,
						data: { condition: "false" }
					});
				}
			} else if (node.next) {
				generatedEdges.push({
					id: `e${node.id}-next`,
					source: node.id,
					target: node.next,
					markerEnd: { type: "arrow", color: "var(--foreground)" },
					type: "custom-edge",
					style: { strokeWidth: 2 },
					className: styles.edge
				});
			}
		});
		return generatedEdges;
	};

	// Event
	const onNodesChange: OnNodesChange<AppNode> = useCallback(changes => {
		setNodes(nds => applyNodeChanges(changes, nds));
	}, []);

	const onEdgesChange: OnEdgesChange = useCallback(changes => {
		setEdges(eds => applyEdgeChanges(changes, eds));
	}, []);

	const onEdgesDelete = useCallback(
		(deletedEdges: Edge[]) => {
			const nextNodes = nodes.map(n => {
				const relatedDeletedEdges = deletedEdges.filter(e => e.source === n.id);
				if (relatedDeletedEdges.length === 0) return n;

				const updatedRaw = { ...n.data.raw };
				relatedDeletedEdges.forEach(edge => {
					if (n.type === "CONDITION") {
						if (edge.sourceHandle === "true") updatedRaw.nextTrue = undefined;
						if (edge.sourceHandle === "false") updatedRaw.nextFalse = undefined;
					} else {
						updatedRaw.next = undefined;
					}
				});

				return {
					...n,
					data: { ...n.data, raw: updatedRaw }
				};
			});

			const nextEdges = edges.filter(e => !deletedEdges.some(de => de.id === e.id));

			updateWorkflow(nextNodes, nextEdges);

			setNodes(nextNodes);
		},
		[nodes, edges, updateWorkflow]
	);

	const onNodesDelete = useCallback(
		(deletedNodes: Node[]) => {
			deletedNodes.forEach(d => deleteNode(d.id));
		},
		[updateWorkflow]
	);

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

			setEdges(eds => {
				const nextEdges = addEdge(newEdge, eds);
				updateWorkflow(nodes, nextEdges);
				return nextEdges;
			});
		},
		[nodes, updateWorkflow]
	);

	const onNodeDragStop: NodeMouseHandler = useCallback(
		(_, draggedNode) => {
			const currentNodes = getNodes() as AppNode[];
			const currentEdges = getEdges();

			const nextNodes = currentNodes.map(n => {
				if (n.id === draggedNode.id) {
					return {
						...n,
						position: draggedNode.position
					};
				}
				return n;
			});

			setNodes(nextNodes);

			updateWorkflow(nextNodes, currentEdges);
		},
		[edges, updateWorkflow]
	);

	const onNodeDoubleClick: NodeMouseHandler = useCallback((_, n) => {
		const nodeData = n.data.raw as NodeItem;
		if (nodeData.type === "SECTION") {
			navigate(`/orgs/${orgSlug}/forms/${formData.id}/section/${n.id}/edit`);
		}
	}, []);

	if (workflowQuery.isLoading) return <LoadingSpinner />;
	if (workflowQuery.isError) return <ErrorMessage message={(workflowQuery.error as Error)?.message ?? "無法載入表單結構"} />;

	return (
		<div ref={reactFlowWrapper} style={{ width: "100%", height: "500px" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				connectionLineType={ConnectionLineType.Straight}
				onNodesChange={onNodesChange}
				onNodesDelete={onNodesDelete}
				onNodeDoubleClick={onNodeDoubleClick}
				onNodeDragStop={onNodeDragStop}
				onEdgesChange={onEdgesChange}
				onEdgesDelete={onEdgesDelete}
				onConnect={onConnect}
				edgeTypes={edgeTypes}
				nodeTypes={nodeTypes}
				fitView
			>
				<Panel position="top-right" className={styles.panel}>
					<Button onClick={() => handleAddNode("SECTION")}>新增區域</Button>
					<Button onClick={() => handleAddNode("CONDITION")}>新增條件</Button>
				</Panel>
				<Background gap={12} size={1} />
				<Controls className={styles.controls} />
			</ReactFlow>
		</div>
	);
};
