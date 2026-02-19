import { Checkbox, Input, TextArea } from "@/shared/components";
import { X } from "lucide-react";
import type { DetailOption } from "../../types/option";
import styles from "./DetailOptionsInput.module.css";

export interface DetailOptionInputProps {
	option: DetailOption;
	onLabelChange?: (value: string) => void;
	onDescriptionChange?: (value: string) => void;
	onRemove?: () => void;
}

export const DetailOptionInput = (props: DetailOptionInputProps) => {
	return (
		<div className={styles.wrapper}>
			<Checkbox className={styles.checkbox} disabled />
			<div className={styles.detailOptionContent}>
				<Input value={props.option.label} variant="flushed" themeColor="--comment" placeholder="標題" size={32} onChange={e => props.onLabelChange?.(e.target.value)} />
				<TextArea className={styles.textArea} value={props.option.description} placeholder="說明" onChange={e => props.onDescriptionChange?.(e.target.value)} />
			</div>
			{props.onRemove && <X className={styles.removeIcon} onClick={props.onRemove} />}
		</div>
	);
};
