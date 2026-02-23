import { Checkbox, Input, TextArea } from "@/shared/components";
import { X } from "lucide-react";
import { useState } from "react";
import type { DetailOption } from "../../types/option";
import styles from "./DetailOptionsInput.module.css";

export interface DetailOptionInputProps {
	option: DetailOption;
	onLabelChange?: (value: string) => void;
	onDescriptionChange?: (value: string) => void;
	onRemove?: () => void;
}

export const DetailOptionInput = (props: DetailOptionInputProps) => {
	const [localLabel, setLocalLabel] = useState(props.option.label);
	const [localDesc, setLocalDesc] = useState(props.option.description);
	return (
		<div className={styles.wrapper}>
			<Checkbox className={styles.checkbox} disabled />
			<div className={styles.detailOptionContent}>
				<Input
					value={localLabel}
					variant="flushed"
					themeColor="--comment"
					placeholder="標題"
					size={32}
					onChange={e => setLocalLabel(e.target.value)}
					onBlur={() => props.onLabelChange?.(localLabel)}
				/>
				<TextArea
					className={styles.textArea}
					value={localDesc}
					placeholder="說明（支援 Markdown）"
					variant="flushed"
					themeColor="--comment"
					onChange={e => setLocalDesc(e.target.value)}
					onBlur={() => props.onDescriptionChange?.(localDesc)}
					rows={1}
				/>
			</div>
			{props.onRemove && <X className={styles.removeIcon} onClick={props.onRemove} />}
		</div>
	);
};
