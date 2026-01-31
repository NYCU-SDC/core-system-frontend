import { Input, TextArea } from "@/shared/components";
import { Checkbox } from "@/shared/components/Checkbox/Checkbox";
import type { DetailOption } from "../types/option";
import styles from "./DetailOptionsInput.module.css";

export interface DetailOptionInputProps {
	option: DetailOption;
}

export const DetailOptionInput = (props: DetailOptionInputProps) => {
	return (
		<div className={styles.wrapper}>
			<Checkbox className={styles.checkbox} disabled />
			<div className={styles.detailOptionContent}>
				<Input value={props.option.label} variant="flushed" themeColor="--comment" placeholder="Title" size={32} />
				<TextArea className={styles.textArea} value={props.option.description} placeholder="Description" />
			</div>
		</div>
	);
};
