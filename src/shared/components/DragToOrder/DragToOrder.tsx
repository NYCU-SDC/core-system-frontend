import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import styles from "./DragToOrder.module.css";

export interface DragItem {
	id: string;
	content: ReactNode;
}

export interface DragToOrderProps {
	items: DragItem[];
	onReorder: (items: DragItem[]) => void;
}

export function DragToOrder({ items, onReorder }: DragToOrderProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		const newItems = [...items];
		const draggedItem = newItems[draggedIndex];
		newItems.splice(draggedIndex, 1);
		newItems.splice(index, 0, draggedItem);

		setDraggedIndex(index);
		onReorder(newItems);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div className={styles.container}>
			{items.map((item, index) => (
				<div
					key={item.id}
					className={`${styles.item} ${draggedIndex === index ? styles.dragging : ""}`}
					draggable
					onDragStart={() => handleDragStart(index)}
					onDragOver={e => handleDragOver(e, index)}
					onDragEnd={handleDragEnd}
				>
					<div className={styles.dragHandle}>
						<GripVertical size={20} />
					</div>
					<div className={styles.content}>{item.content}</div>
				</div>
			))}
		</div>
	);
}
