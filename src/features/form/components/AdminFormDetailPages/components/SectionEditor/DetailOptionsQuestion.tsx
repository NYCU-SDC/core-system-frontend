import { Plus } from "lucide-react";
import type { DetailOption } from "../../types/option";
import { DetailOptionInput } from "./DetailOptionsInput";
import styles from "./DetailOptionsQuestion.module.css";

export interface DetailOptionsQuestionProps {
	options: Array<DetailOption>;
	onAdd: () => void;
}

export const DetailOptionsQuestion = (props: DetailOptionsQuestionProps) => {
	return (
		<div className={styles.container}>
			{props.options.map((option, index) => (
				<DetailOptionInput key={index} option={option} />
			))}
			<div className={styles.addContainer} onClick={props.onAdd}>
				<Plus className={styles.addIcon} />
			</div>
		</div>
	);
};
