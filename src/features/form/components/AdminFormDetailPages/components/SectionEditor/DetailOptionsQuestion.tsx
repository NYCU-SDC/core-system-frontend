import type { DetailOption } from "@/features/form/components/AdminFormDetailPages/types/question";
import { Plus } from "lucide-react";
import { DetailOptionInput } from "./DetailOptionsInput";
import styles from "./DetailOptionsQuestion.module.css";

export interface DetailOptionsQuestionProps {
	options: Array<DetailOption>;
	onAdd: () => void;
	onEdit?: (index: number, field: "label" | "description", value: string) => void;
	onRemove?: (index: number) => void;
}

export const DetailOptionsQuestion = (props: DetailOptionsQuestionProps) => {
	return (
		<div className={styles.container}>
			{props.options.map((option, index) => (
				<DetailOptionInput
					key={option.id ?? index}
					option={option}
					onLabelChange={value => props.onEdit?.(index, "label", value)}
					onDescriptionChange={value => props.onEdit?.(index, "description", value)}
					onRemove={props.onRemove ? () => props.onRemove!(index) : undefined}
				/>
			))}
			<div className={styles.addContainer} onClick={props.onAdd}>
				<Plus className={styles.addIcon} />
			</div>
		</div>
	);
};
