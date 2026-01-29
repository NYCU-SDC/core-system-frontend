import { X } from "lucide-react";
import type { Option } from "../types/option";
import { OptionsInput } from "./OptionsInput";
import styles from "./OptionsQuestion.module.css";

export interface OptionsQuestionProps {
	type: "radio" | "checkbox" | "list";
	options: Array<Option>;
	isFromAnswer: boolean;
	onChange: (optionIndex: number, newLabel: string) => void;
	onAdd: () => void;
	onAddOther: () => void;
	onRemove: (optionIndex: number) => void;
	onRemoveOther: () => void;
}

export const OptionsQuestion = (props: OptionsQuestionProps) => {
	return (
		<div className={styles.container}>
			{props.options.map((option, index) => {
				if (!option.isOther) {
					return (
						<div className={styles.optionWrapper}>
							<OptionsInput
								key={index}
								value={option.label}
								type={props.type}
								themeColor="--comment"
								variant="flushed"
								listLabel={`${index + 1}.`}
								className={styles.optionInput}
								autoFocus={index === props.options.length - 1 - props.options.filter(option => option.isOther).length}
								onChange={e => props.onChange(index, e.target.value)}
							/>
							{props.options.length > 1 && <X onClick={() => props.onRemove(index)} />}
						</div>
					);
				}
				if (option.isOther) {
					return (
						<div className={styles.optionWrapper}>
							<OptionsInput key="other" value="其他" type={props.type} variant="none" readOnly />
							{props.options.length > 1 && <X onClick={props.onRemoveOther} />}
						</div>
					);
				}
			})}
			<div className={styles.addOptions}>
				<OptionsInput value="新增選項" type={props.type} variant="none" onClick={props.onAdd} listLabel={`${props.options.length + 1}.`} readOnly />
				{!props.options.some(option => option.isOther) && props.type !== "list" && (
					<>
						或
						<a className={styles.addOther} onClick={props.onAddOther}>
							新增其他
						</a>
					</>
				)}
			</div>
		</div>
	);
};
