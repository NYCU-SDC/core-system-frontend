import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useSections } from "@/features/form/hooks/useSections";
import { useCreateWorkflowNode, useUpdateWorkflow, useWorkflow } from "@/features/form/hooks/useWorkflow";
import { Button, ErrorMessage, LoadingSpinner, useToast } from "@/shared/components";
import type { FormWorkflowNodeRequest, FormsForm } from "@nycu-sdc/core-system-sdk";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { FlowRenderer } from "./components/FormEditor/FlowRenderer";
import styles from "./EditPage.module.css";
import type { NodeItem } from "./types/workflow";

interface AdminFormEditPageProps {
	formData: FormsForm;
}

const toApiNodes = (nodes: NodeItem[]): FormWorkflowNodeRequest[] =>
	nodes.map(n => ({
		id: n.id,
		label: n.label,
		...(n.title !== undefined && { title: n.title }),
		...(n.description !== undefined && { description: n.description }),
		...(n.conditionRule !== undefined && { conditionRule: n.conditionRule }),
		...(n.next !== undefined && { next: n.next }),
		...(n.nextTrue !== undefined && { nextTrue: n.nextTrue }),
		...(n.nextFalse !== undefined && { nextFalse: n.nextFalse })
	}));

export const AdminFormEditPage = ({ formData }: AdminFormEditPageProps) => {
	const { pushToast } = useToast();
	const navigate = useNavigate();
	const orgSlug = useActiveOrgSlug();
	const workflowQuery = useWorkflow(formData.id);
	const updateWorkflowMutation = useUpdateWorkflow(formData.id);
	const createWorkflowNodeMutation = useCreateWorkflowNode(formData.id);

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

	const postProcessNodes = (nodes: NodeItem[]): NodeItem[] => {
		// Pass 1: compute mergeIds and collapse non-CONDITION branch nodes — use
		// a read-only snapshot for lookups so mutations don't affect other nodes'
		// findMergeNodeId calculations.
		const snapshot = new Map<string, NodeItem>(nodes.map(n => [n.id, { ...n, isMergeNode: false }]));

		const pass1 = nodes.map(node => {
			const copy = { ...node, isMergeNode: false };
			if (copy.nextTrue || copy.nextFalse) {
				const mergeId = findMergeNodeId(copy, snapshot);
				if (copy.nextTrue === mergeId && copy.type !== "CONDITION") {
					copy.next = copy.nextFalse;
					copy.nextFalse = undefined;
					copy.nextTrue = undefined;
				} else if (copy.nextFalse === mergeId && copy.type !== "CONDITION") {
					copy.next = copy.nextTrue;
					copy.nextFalse = undefined;
					copy.nextTrue = undefined;
				} else if (mergeId) {
					copy.mergeId = mergeId;
				}
			}
			return copy;
		});

		// Pass 2: mark merge nodes (nodes pointed to by more than one parent)
		return pass1.map(node => ({
			...node,
			isMergeNode: pass1.filter(n => n.next === node.id).length + pass1.filter(n => n.nextTrue === node.id).length + pass1.filter(n => n.nextFalse === node.id).length > 1
		}));
	};

	const [nodeItems, setNodeItems] = useState<NodeItem[]>([]);
	const initializedRef = useRef(false);
	const sectionsQuery = useSections(formData.id);

	const createNodeViaSdk = async (type: "SECTION" | "CONDITION", fallbackLabel: string): Promise<NodeItem | null> => {
		try {
			const created = await createWorkflowNodeMutation.mutateAsync({ type });
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

	const handleNodeChange = (id: string, updates: Partial<NodeItem>) => {
		setNodeItems(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
	};

	useEffect(() => {
		if (initializedRef.current) return;
		if (workflowQuery.isLoading) return;
		if (workflowQuery.data && workflowQuery.data.length > 0) {
			initializedRef.current = true;
			const loaded: NodeItem[] = workflowQuery.data.map(n => {
				const node = n as typeof n & { title?: string; description?: string };
				return {
					id: n.id ?? uuidv4(),
					label: n.label ?? "",
					type: (n.type as NodeItem["type"]) ?? "SECTION",
					...(node.title !== undefined && { title: node.title }),
					...(node.description !== undefined && { description: node.description }),
					...(n.conditionRule !== undefined && { conditionRule: n.conditionRule }),
					...(n.next !== undefined && { next: n.next }),
					...(n.nextTrue !== undefined && { nextTrue: n.nextTrue }),
					...(n.nextFalse !== undefined && { nextFalse: n.nextFalse })
				};
			});
			setNodeItems(postProcessNodes(loaded));
		} else if (workflowQuery.data) {
			// API returned empty workflow — seed with minimal default
			initializedRef.current = true;
			const defaultNodes: NodeItem[] = [
				{ id: uuidv4(), label: "開始表單", type: "START", next: "__section__" },
				{ id: "__section__", label: "第一區塊", type: "SECTION", next: "__end__" },
				{ id: "__end__", label: "確認 / 送出", type: "END" }
			];
			setNodeItems(postProcessNodes(defaultNodes));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowQuery.data, workflowQuery.isLoading]);

	const handleAddSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddTrueSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddTrueCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddFalseSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionNodeBase = await createNodeViaSdk("SECTION", `新區塊 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddFalseCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`);
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
		setNodeItems(processedNodes);
	};

	const handleAddMergeSection = async (id: string) => {
		const prevNodes = [...nodeItems];
		const nodeToUpdate = prevNodes.find(node => node.id === id);
		if (!nodeToUpdate) {
			return;
		}
		const newMergeNodeBase = await createNodeViaSdk("SECTION", `合併節點 ${prevNodes.length + 1}`);
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
			if (!truePath.includes(node.id) && !falsePath.includes(node.id)) {
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
		setNodeItems(processedNodes);
	};

	const handleAddMergeCondition = async (id: string) => {
		const prevNodes = [...nodeItems];
		const nodeToUpdate = prevNodes.find(node => node.id === id);
		if (!nodeToUpdate) {
			return;
		}
		const newConditionNodeBase = await createNodeViaSdk("CONDITION", `新條件 ${prevNodes.length + 1}`);
		const trueSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 真 ${prevNodes.length + 1}`);
		const falseSectionNodeBase = await createNodeViaSdk("SECTION", `條件區塊 假 ${prevNodes.length + 1}`);
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

		const nodeMap = new Map<string, NodeItem>(prevNodes.map(n => [n.id, n]));
		const truePath = getPath(nodeToUpdate.nextTrue || "", nodeMap);
		const falsePath = getPath(nodeToUpdate.nextFalse || "", nodeMap);

		const updatedNodes = prevNodes.map(node => {
			if (!truePath.includes(node.id) && !falsePath.includes(node.id)) {
				return node;
			}
			if (node.next === nodeToUpdate.mergeId) {
				return { ...node, next: newConditionId };
			}
			if (node.nextTrue === nodeToUpdate.mergeId) {
				return { ...node, nextTrue: newConditionId };
			}
			if (node.nextFalse === nodeToUpdate.mergeId) {
				return { ...node, nextFalse: newConditionId };
			}
			return node;
		});
		updatedNodes.push(newConditionNode, trueSectionNode, falseSectionNode);
		const processedNodes = postProcessNodes(updatedNodes);
		setNodeItems(processedNodes);
	};

	const handleDeleteSection = (id: string) => {
		const prevNodes = [...nodeItems];
		if (prevNodes.length <= 3) {
			pushToast({
				title: "無法刪除區塊",
				description: "表單必須至少包含開始、結束及一個區塊。",
				variant: "error"
			});
			return;
		}
		const nodeToDelete = prevNodes.find(node => node.id === id);
		const nodeToMerge = prevNodes.find(node => node.nextFalse === id || node.nextTrue === id);
		if (!nodeToDelete) return;
		if ((nodeToMerge || nodeToDelete.isMergeNode) && nodeToDelete.type === "CONDITION" && nodeToDelete.nextTrue !== nodeToDelete.mergeId && nodeToDelete.nextFalse !== nodeToDelete.mergeId) {
			pushToast({
				title: "無法刪除條件節點",
				description: "請確保只有一個可辨識的分支路徑後再嘗試刪除。",
				variant: "error"
			});
			return;
		}

		if (!nodeToDelete) return;
		const updatedNodes = prevNodes
			.filter(node => node.id !== id)
			.map(node => {
				if (node.next === id) {
					return {
						...node,
						next: nodeToDelete.next || (nodeToDelete.mergeId === nodeToDelete.nextTrue ? nodeToDelete.nextFalse : nodeToDelete.mergeId === nodeToDelete.nextFalse ? nodeToDelete.nextTrue : undefined),
						nextTrue: nodeToDelete.nextTrue,
						nextFalse: nodeToDelete.nextFalse
					};
				}
				if (node.nextFalse === id) {
					return {
						...node,
						nextFalse: nodeToDelete.next || (nodeToDelete.mergeId === nodeToDelete.nextTrue ? nodeToDelete.nextFalse : nodeToDelete.nextTrue),
						nextTrue: node.type === "CONDITION" && nodeToDelete.isMergeNode ? nodeToDelete.next : node.nextTrue
					};
				}
				if (node.nextTrue === id) {
					return {
						...node,
						nextTrue: nodeToDelete.next || (nodeToDelete.mergeId === nodeToDelete.nextTrue ? nodeToDelete.nextFalse : nodeToDelete.nextTrue),
						nextFalse: node.type === "CONDITION" && nodeToDelete.isMergeNode ? nodeToDelete.next : node.nextFalse
					};
				}
				return node;
			});

		const processedNodes = postProcessNodes(updatedNodes);
		setNodeItems(processedNodes);
	};

	const handleSave = () => {
		updateWorkflowMutation.mutate(toApiNodes(nodeItems), {
			onSuccess: () => pushToast({ title: "儲存成功", description: "表單結構已更新。", variant: "success" }),
			onError: error => pushToast({ title: "儲存失敗", description: (error as Error).message, variant: "error" })
		});
	};

	const handleEditSection = (nodeId: string) => {
		navigate(`/orgs/${orgSlug}/forms/${formData.id}/section/${nodeId}/edit`);
	};

	if (workflowQuery.isLoading) return <LoadingSpinner />;
	if (workflowQuery.isError) return <ErrorMessage message={(workflowQuery.error as Error)?.message ?? "無法載入表單結構"} />;

	return (
		<>
			<div className={styles.header}>
				<h2>表單結構</h2>
				<Button onClick={handleSave} disabled={updateWorkflowMutation.isPending}>
					{updateWorkflowMutation.isPending ? "儲存中…" : "儲存 Workflow"}
				</Button>
			</div>
			<blockquote className={styles.description}>點擊區塊以新增或編輯條件與問題</blockquote>
			<div className={styles.flowContainer}>
				<FlowRenderer
					nodes={nodeItems}
					sections={sectionsQuery.data}
					onNodeChange={handleNodeChange}
					onAddSection={handleAddSection}
					onDeleteSection={handleDeleteSection}
					onAddCondition={handleAddCondition}
					onAddTrueSection={handleAddTrueSection}
					onAddFalseSection={handleAddFalseSection}
					onAddTrueCondition={handleAddTrueCondition}
					onAddFalseCondition={handleAddFalseCondition}
					onAddMergeSection={handleAddMergeSection}
					onAddMergeCondition={handleAddMergeCondition}
					onEditSection={handleEditSection}
				/>
			</div>
		</>
	);
};
