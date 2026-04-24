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

	const [nodeItems, setNodeItems] = useState<NodeItem[]>([]);
	const initializedRef = useRef(false);
	const sectionsQuery = useSections(formData.id);

	const getNodePayload = (anchorId?: string) => {
		const anchorIndex = anchorId ? nodeItems.findIndex(node => node.id === anchorId) : -1;
		const row = anchorIndex >= 0 ? anchorIndex + 1 : nodeItems.length;
		return {
			x: 240,
			y: 120 + row * 140
		};
	};

	const createNodeViaSdk = async (type: "SECTION" | "CONDITION", fallbackLabel: string, anchorId?: string): Promise<NodeItem | null> => {
		try {
			const created = await createWorkflowNodeMutation.mutateAsync({
				type,
				payload: getNodePayload(anchorId)
			});
			return {
				id: created.id,
				label: created.label || fallbackLabel,
				type
			};
		} catch (error) {
			pushToast({ title: "新增節點失敗", description: (error as Error).message, variant: "error" });
			return null;
		}
	};

	const nodeChangeSaveTimerRef = useRef<number | null>(null);

	const handleNodeChange = (id: string, updates: Partial<NodeItem>) => {
		const updated = nodeItems.map(n => (n.id === id ? { ...n, ...updates } : n));
		setNodeItems(updated);
		if (nodeChangeSaveTimerRef.current !== null) window.clearTimeout(nodeChangeSaveTimerRef.current);
		nodeChangeSaveTimerRef.current = window.setTimeout(() => {
			updateWorkflowMutation.mutate(toApiNodes(updated), {
				onError: error => pushToast({ title: "儲存失敗", description: (error as Error).message, variant: "error" })
			});
		}, 800);
	};

	useEffect(() => {
		if (workflowQuery.isLoading) return;
		if (!workflowQuery.data) return;

		const mapNode = (n: (typeof workflowQuery.data.workflow)[number]): NodeItem => ({
			id: n.id ?? uuidv4(),
			label: n.label ?? "",
			type: (n.type as NodeItem["type"]) ?? "SECTION",
			...(n.conditionRule !== undefined && { conditionRule: n.conditionRule }),
			...(n.next !== undefined && { next: n.next }),
			...(n.nextTrue !== undefined && { nextTrue: n.nextTrue }),
			...(n.nextFalse !== undefined && { nextFalse: n.nextFalse })
		});

		if (!initializedRef.current) {
			// First load — fully initialize from API or seed defaults
			initializedRef.current = true;
			if (workflowQuery.data.workflow.length > 0) {
				setNodeItems(postProcessNodes(workflowQuery.data.workflow.map(mapNode)));
			} else {
				const defaultNodes: NodeItem[] = [
					{ id: uuidv4(), label: "開始表單", type: "START", next: "__section__" },
					{ id: "__section__", label: "第一區塊", type: "SECTION", next: "__end__" },
					{ id: "__end__", label: "確認 / 送出", type: "END" }
				];
				setNodeItems(postProcessNodes(defaultNodes));
			}
		} else {
			// Subsequent refetch — only patch labels so external edits (e.g. section title change) are reflected
			setNodeItems(prev =>
				prev.map(local => {
					const remote = workflowQuery.data!.workflow.find(n => n.id === local.id);
					if (!remote) return local;
					return { ...local, label: remote.label ?? local.label };
				})
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowQuery.data, workflowQuery.isLoading]);

	const handleAddSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`, id);
		if (!newSectionNodeBase) return;
		const newSectionId = newSectionNodeBase.id;
		const newSectionNode: NodeItem = {
			...newSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.next
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, next: newSectionId };
			}
			return node;
		});
		updatedNodes.push(newSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddTrueSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`, id);
		if (!newSectionNodeBase) return;
		const newSectionId = newSectionNodeBase.id;
		const newSectionNode: NodeItem = {
			...newSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextTrue
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, nextTrue: newSectionId };
			}
			return node;
		});
		updatedNodes.push(newSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddTrueCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`, id);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`, id);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`, id);
		if (!newConditionNodeBase || !trueSectionNodeBase || !falseSectionNodeBase) return;
		const newConditionId = newConditionNodeBase.id;
		const newTrueSectionId = trueSectionNodeBase.id;
		const newFalseSectionId = falseSectionNodeBase.id;
		const newConditionNode: NodeItem = {
			...newConditionNodeBase,
			nextTrue: newTrueSectionId,
			nextFalse: newFalseSectionId
		};
		const trueSectionNode: NodeItem = {
			...trueSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextTrue
		};
		const falseSectionNode: NodeItem = {
			...falseSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextTrue
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, nextTrue: newConditionId };
			}
			return node;
		});
		updatedNodes.push(newConditionNode, trueSectionNode, falseSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddFalseSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`, id);
		if (!newSectionNodeBase) return;
		const newSectionId = newSectionNodeBase.id;
		const newSectionNode: NodeItem = {
			...newSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextFalse
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, nextFalse: newSectionId };
			}
			return node;
		});
		updatedNodes.push(newSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddFalseCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`, id);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`, id);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`, id);
		if (!newConditionNodeBase || !trueSectionNodeBase || !falseSectionNodeBase) return;
		const newConditionId = newConditionNodeBase.id;
		const newTrueSectionId = trueSectionNodeBase.id;
		const newFalseSectionId = falseSectionNodeBase.id;
		const newConditionNode: NodeItem = {
			...newConditionNodeBase,
			nextTrue: newTrueSectionId,
			nextFalse: newFalseSectionId
		};
		const trueSectionNode: NodeItem = {
			...trueSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextFalse
		};
		const falseSectionNode: NodeItem = {
			...falseSectionNodeBase,
			next: prevNodes.find(node => node.id === id)?.nextFalse
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, nextFalse: newConditionId };
			}
			return node;
		});
		updatedNodes.push(newConditionNode, trueSectionNode, falseSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`, id);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`, id);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`, id);
		if (!newConditionNodeBase || !trueSectionNodeBase || !falseSectionNodeBase) return;
		const newConditionId = newConditionNodeBase.id;
		const newTrueSectionId = trueSectionNodeBase.id;
		const newFalseSectionId = falseSectionNodeBase.id;
		const newConditionNode: NodeItem = {
			...newConditionNodeBase,
			nextTrue: newTrueSectionId,
			nextFalse: newFalseSectionId
		};
		const oldNext = prevNodes.find(node => node.id === id)?.next;
		const trueSectionNode: NodeItem = {
			...trueSectionNodeBase,
			next: oldNext
		};
		const falseSectionNode: NodeItem = {
			...falseSectionNodeBase,
			next: oldNext
		};
		const updatedNodes = prevNodes.map(node => {
			if (node.id === id) {
				return { ...node, next: newConditionId };
			}
			return node;
		});
		updatedNodes.push(newConditionNode, trueSectionNode, falseSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddMergeSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const nodeToUpdate = prevNodes.find(node => node.id === id);
		if (!nodeToUpdate) {
			return;
		}
		const newMergeNodeBase = await createNodeViaSdk("SECTION", `合併節點 ${prevNodes.length + 1}`, id);
		if (!newMergeNodeBase) return;
		const newMergeNodeId = newMergeNodeBase.id;
		const newMergeNode: NodeItem = {
			...newMergeNodeBase,
			next: nodeToUpdate?.mergeId || undefined
		};

		const nodeMap = new Map<string, NodeItem>(prevNodes.map(n => [n.id, n]));
		const truePath = getPath(nodeToUpdate.nextTrue || "", nodeMap);
		const falsePath = getPath(nodeToUpdate.nextFalse || "", nodeMap);

		const updatedNodes = prevNodes.map(node => {
			if (!truePath.includes(node.id) && !falsePath.includes(node.id) && node.id !== id) {
				return node;
			}
			if (node.next === nodeToUpdate.mergeId) {
				return { ...node, next: newMergeNodeId };
			}
			if (node.nextTrue === nodeToUpdate.mergeId) {
				return { ...node, nextTrue: newMergeNodeId };
			}
			if (node.nextFalse === nodeToUpdate.mergeId) {
				return { ...node, nextFalse: newMergeNodeId };
			}
			return node;
		});
		updatedNodes.push(newMergeNode);
		const processedNodes = postProcessNodes(updatedNodes);
		saveNodes(processedNodes);
	};

	const handleAddMergeCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const nodeToUpdate = prevNodes.find(node => node.id === id);
		if (!nodeToUpdate) {
			return;
		}
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`, id);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`, id);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`, id);
		if (!newConditionNodeBase || !trueSectionNodeBase || !falseSectionNodeBase) return;
		const newConditionId = newConditionNodeBase.id;
		const newTrueSectionId = trueSectionNodeBase.id;
		const newFalseSectionId = falseSectionNodeBase.id;
		const newConditionNode: NodeItem = {
			...newConditionNodeBase,
			nextTrue: newTrueSectionId,
			nextFalse: newFalseSectionId
		};
		const trueSectionNode: NodeItem = {
			...trueSectionNodeBase,
			next: nodeToUpdate?.mergeId || undefined
		};
		const falseSectionNode: NodeItem = {
			...falseSectionNodeBase,
			next: nodeToUpdate?.mergeId || undefined
		};

		const allQuestions = sectionsQuery.data.flatMap(sb => sb.questions?.map(q => ({ ...q, sectionTitle: sb.section.title })) || []) || [];
		const serverWorkflow = workflowQuery.data.workflow;

		const isInitPhase = !isInitialized.current;

		setNodes(prevNodes => {
			if (isInitPhase) {
				return serverWorkflow.map(node => ({
					id: node.id,
					type: node.type as AppNode["type"],
					position: { x: node.payload?.x ?? 0, y: node.payload?.y ?? 0 },
					data: { label: node.label, raw: node, questions: allQuestions, onUpdateCondition: handleConditionSelectedChange, onUpdateChoice: handleChoiceChange }
				}));
			}
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

		setEdges(prevEdges => {
			if (isInitPhase) {
				return generateEdgesFromData(serverWorkflow);
			}
			return prevEdges;
		});

		if (isInitPhase) {
			isInitialized.current = true;
		}
	}, [workflowQuery.data, sectionsQuery.data, handleConditionSelectedChange, handleChoiceChange]);

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
		[deleteNode]
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
		[updateWorkflow, getNodes, getEdges]
	);

	const onNodeDoubleClick: NodeMouseHandler = useCallback(
		(_, n) => {
			const nodeData = n.data.raw as NodeItem;
			if (nodeData.type === "SECTION") {
				navigate(`/orgs/${orgSlug}/forms/${formData.id}/section/${n.id}/edit`);
			}
		},
		[orgSlug, formData.id, navigate]
	);

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
