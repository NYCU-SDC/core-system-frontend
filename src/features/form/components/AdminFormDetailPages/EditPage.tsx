import { Toast } from "@/shared/components/Toast/Toast";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FlowRenderer } from "./components/FormEditor/FlowRenderer";
import styles from "./EditPage.module.css";
import type { NodeItem } from "./types/workflow";

export const AdminFormEditPage = () => {
	const [nodeItems, setNodeItems] = useState<NodeItem[]>([]);
	const [toastOpen, setToastOpen] = useState(false);

	const { formid } = useParams();
	const navigate = useNavigate();

	console.log("Rendering AdminFormEditPage with nodes:", nodeItems);

	useEffect(() => {
		const nodeItems: NodeItem[] = [
			{ id: "start", label: "開始表單", type: "START", next: "groupSelection" },
			{ id: "groupSelection", label: "選擇組別", type: "SECTION", next: "condition" },
			{ id: "condition", label: "條件判斷", type: "CONDITION", nextTrue: "sectionA", nextFalse: "sectionB" },
			{ id: "sectionA", label: "條件區塊 A", type: "SECTION", next: "mergeNode" },
			{ id: "sectionB", label: "條件區塊 B", type: "SECTION", next: "mergeNode" },
			{ id: "mergeNode", label: "合併節點", type: "SECTION", next: "end" },
			{ id: "end", label: "確認 / 送出", type: "END" }
		];
		const processedNodes = postProcessNodes(nodeItems);
		setNodeItems(processedNodes);
	}, []);

	const handleEditForm = (sectionId: string) => {
		navigate(`/orgs/sdc/forms/${formid}/section/${sectionId}/edit`);
	};

	const postProcessNodes = (nodes: NodeItem[]): NodeItem[] => {
		const updatedNodes = nodes.map(node => ({ ...node, isMergeNode: false }));
		updatedNodes.forEach(node => {
			if (updatedNodes.filter(n => n.next === node.id || n.nextTrue === node.id || n.nextFalse === node.id).length > 1) {
				node.isMergeNode = true;
			}
		});
		// Find the merge nodes of condition nodes
		const findMergeNodeId = (node: NodeItem): string | null => {
			if (!node.nextTrue || !node.nextFalse) return null;

			const getPath = (startId: string): string[] => {
				const path: string[] = [];
				let currentId: string | undefined = startId;
				while (currentId) {
					path.push(currentId);
					const nextNode = updatedNodes.find(n => n.id === currentId);
					currentId = nextNode?.next;
				}
				return path;
			};

			const truePath = getPath(node.nextTrue);
			const falsePath = getPath(node.nextFalse);

			for (const id of truePath) {
				if (falsePath.includes(id)) {
					return id;
				}
			}

			return null;
		};

		updatedNodes.forEach(node => {
			if (node.type === "CONDITION") {
				const mergeNodeId = findMergeNodeId(node);
				if (mergeNodeId) {
					const mergeNode = updatedNodes.find(n => n.id === mergeNodeId);
					if (mergeNode) {
						mergeNode.isMergeNode = true;
						node.mergeId = mergeNodeId;
					}
				}
			}
		});

		return updatedNodes;
	};

	const handleAddSection = (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionId = `section_${prevNodes.length + 1}`;
		const newSectionNode: NodeItem = {
			id: newSectionId,
			label: `新區塊 ${prevNodes.length + 1}`,
			type: "SECTION",
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

	const handleAddTrueSection = (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionId = `section_${prevNodes.length + 1}`;
		const newSectionNode: NodeItem = {
			id: newSectionId,
			label: `新區塊 ${prevNodes.length + 1}`,
			type: "SECTION",
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

	const handleAddTrueCondition = (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionId = `condition_${prevNodes.length + 1}`;
		const newConditionNode: NodeItem = {
			id: newConditionId,
			label: `新條件 ${prevNodes.length + 1}`,
			type: "CONDITION",
			nextTrue: `section_true_${prevNodes.length + 1}`,
			nextFalse: `section_false_${prevNodes.length + 1}`
		};
		const trueSectionNode: NodeItem = {
			id: `section_true_${prevNodes.length + 1}`,
			label: `條件區塊 真 ${prevNodes.length + 1}`,
			type: "SECTION",
			next: prevNodes.find(node => node.id === id)?.nextTrue
		};
		const falseSectionNode: NodeItem = {
			id: `section_false_${prevNodes.length + 1}`,
			label: `條件區塊 假 ${prevNodes.length + 1}`,
			type: "SECTION",
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

	const handleAddFalseSection = (id: string) => {
		const prevNodes = [...nodeItems];
		const newSectionId = `section_${prevNodes.length + 1}`;
		const newSectionNode: NodeItem = {
			id: newSectionId,
			label: `新區塊 ${prevNodes.length + 1}`,
			type: "SECTION",
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

	const handleAddFalseCondition = (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionId = `condition_${prevNodes.length + 1}`;
		const newConditionNode: NodeItem = {
			id: newConditionId,
			label: `新條件 ${prevNodes.length + 1}`,
			type: "CONDITION",
			nextTrue: `section_true_${prevNodes.length + 1}`,
			nextFalse: `section_false_${prevNodes.length + 1}`
		};
		const trueSectionNode: NodeItem = {
			id: `section_true_${prevNodes.length + 1}`,
			label: `條件區塊 真 ${prevNodes.length + 1}`,
			type: "SECTION",
			next: prevNodes.find(node => node.id === id)?.nextFalse
		};
		const falseSectionNode: NodeItem = {
			id: `section_false_${prevNodes.length + 1}`,
			label: `條件區塊 假 ${prevNodes.length + 1}`,
			type: "SECTION",
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

	const handleAddCondition = (id: string) => {
		const prevNodes = [...nodeItems];
		const newConditionId = `condition_${prevNodes.length + 1}`;
		const newConditionNode: NodeItem = {
			id: newConditionId,
			label: `新條件 ${prevNodes.length + 1}`,
			type: "CONDITION",
			nextTrue: `section_true_${prevNodes.length + 1}`,
			nextFalse: `section_false_${prevNodes.length + 1}`
		};
		const trueSectionNode: NodeItem = {
			id: `section_true_${prevNodes.length + 1}`,
			label: `條件區塊 真 ${prevNodes.length + 1}`,
			type: "SECTION",
			next: prevNodes.find(node => node.id === id)?.next
		};
		const falseSectionNode: NodeItem = {
			id: `section_false_${prevNodes.length + 1}`,
			label: `條件區塊 假 ${prevNodes.length + 1}`,
			type: "SECTION",
			next: prevNodes.find(node => node.id === id)?.next
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

	const handleDeleteSection = (id: string) => {
		const prevNodes = [...nodeItems];
		if (prevNodes.length <= 3) {
			setToastOpen(true);
			return;
		}
		const nodeToDelete = prevNodes.find(node => node.id === id);

		const trueBranch: NodeItem[] = [];
		if (nodeToDelete?.type === "CONDITION") {
			let nextId = nodeToDelete.nextTrue;
			while (nextId) {
				const nextNode = prevNodes.find(node => node.id === nextId);
				if (nextNode && !nextNode.isMergeNode) {
					trueBranch.push(nextNode);
					nextId = nextNode.next;
				} else {
					break;
				}
			}
		}

		console.log("Deleting node:", nodeToDelete);

		if (!nodeToDelete) return;
		const updatedNodes = prevNodes
			.filter(node => node.id !== id && !trueBranch.some(tbNode => tbNode.id === node.id))
			.map(node => {
				if (node.next === id) {
					if (nodeToDelete.type === "CONDITION") {
						return { ...node, next: nodeToDelete.nextFalse || nodeToDelete.next };
					}
					return { ...node, next: nodeToDelete.next };
				}
				if (node.nextFalse === id) {
					return { ...node, nextFalse: nodeToDelete.next };
				}
				if (node.nextTrue === id) {
					return { ...node, nextTrue: nodeToDelete.next };
				}
				return node;
			});
		setNodeItems(updatedNodes);
	};

	return (
		<>
			<h2>表單結構</h2>
			<blockquote className={styles.description}>點擊區塊已新增或編輯條件與問題</blockquote>
			<button onClick={() => handleEditForm("test")}>Edit Form</button>
			<Toast open={toastOpen} onOpenChange={setToastOpen} title="Error!" description="At least one section must remain." variant="error" />
			<div className={styles.flowContainer}>
				<FlowRenderer
					nodes={nodeItems}
					onAddSection={handleAddSection}
					onDeleteSection={handleDeleteSection}
					onAddCondition={handleAddCondition}
					onAddTrueSection={handleAddTrueSection}
					onAddFalseSection={handleAddFalseSection}
					onAddTrueCondition={handleAddTrueCondition}
					onAddFalseCondition={handleAddFalseCondition}
				/>
			</div>
		</>
	);
};
