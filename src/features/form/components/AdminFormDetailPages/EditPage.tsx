import { Toast } from "@/shared/components/Toast/Toast";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FlowRenderer } from "./components/FormEditor/FlowRenderer";
import styles from "./EditPage.module.css";
import type { NodeItem } from "./types/workflow";

export const AdminFormEditPage = () => {
	const [nodeItems, setNodeItems] = useState<NodeItem[]>([]);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastTitle, setToastTitle] = useState("");
	const [toastDescription, setToastDescription] = useState("");

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
		console.log("Post-processing nodes:", nodes);
		const updatedNodes = nodes.map(node => ({ ...node, isMergeNode: false }));
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

		// Find the merge nodes of condition nodes
		const findMergeNodeId = (node: NodeItem): string | null => {
			if (!node.nextTrue || !node.nextFalse) return null;

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
			if (node.nextTrue || node.nextFalse) {
				const mergeId = findMergeNodeId(node);
				if (node.nextTrue == mergeId && node.type !== "CONDITION") {
					node.next = node.nextFalse;
					node.nextFalse = undefined;
					node.nextTrue = undefined;
				}
				if (node.nextFalse == mergeId && node.type !== "CONDITION") {
					node.next = node.nextTrue;
					node.nextFalse = undefined;
					node.nextTrue = undefined;
				}

				if (mergeId) {
					node.mergeId = mergeId;
				}
			}
		});

		updatedNodes.forEach(node => {
			if (updatedNodes.filter(n => n.next === node.id || n.nextTrue === node.id || n.nextFalse === node.id).length > 1) {
				node.isMergeNode = true;
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
			next: prevNodes.find(node => node.id === id)?.next || prevNodes.find(node => node.id === id)?.nextTrue
		};
		const falseSectionNode: NodeItem = {
			id: `section_false_${prevNodes.length + 1}`,
			label: `條件區塊 假 ${prevNodes.length + 1}`,
			type: "SECTION",
			next: prevNodes.find(node => node.id === id)?.next || prevNodes.find(node => node.id === id)?.nextFalse
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
			setToastTitle("無法刪除區塊");
			setToastDescription("表單必須至少包含開始、結束及一個區塊。");
			return;
		}
		const nodeToDelete = prevNodes.find(node => node.id === id);
		const nodeToMerge = prevNodes.find(node => node.nextFalse === id || node.nextTrue === id);
		if (!nodeToDelete) return;
		if (nodeToMerge && nodeToDelete.type === "CONDITION" && nodeToDelete.nextTrue !== nodeToDelete.mergeId && nodeToDelete.nextFalse !== nodeToDelete.mergeId) {
			setToastOpen(true);
			setToastTitle("無法刪除條件節點");
			setToastDescription("請確保只有一個可辨識的分支路後再嘗試刪除。");
			return;
		}

		if (!nodeToDelete) return;
		const updatedNodes = prevNodes
			.filter(node => node.id !== id)
			.map(node => {
				if (node.next === id) {
					return { ...node, next: nodeToDelete.next, nextTrue: nodeToDelete.nextTrue, nextFalse: nodeToDelete.nextFalse };
				}
				if (node.nextFalse === id) {
					return { ...node, nextFalse: nodeToDelete.next || (nodeToDelete.mergeId === nodeToDelete.nextTrue ? nodeToDelete.nextFalse : nodeToDelete.nextFalse) };
				}
				if (node.nextTrue === id) {
					return { ...node, nextTrue: nodeToDelete.next || (nodeToDelete.mergeId === nodeToDelete.nextTrue ? nodeToDelete.nextFalse : nodeToDelete.nextFalse) };
				}
				return node;
			});

		const processedNodes = postProcessNodes(updatedNodes);
		setNodeItems(processedNodes);
	};

	return (
		<>
			<h2>表單結構</h2>
			<blockquote className={styles.description}>點擊區塊已新增或編輯條件與問題</blockquote>
			<Toast open={toastOpen} onOpenChange={setToastOpen} title={toastTitle} description={toastDescription} variant="error" />
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
