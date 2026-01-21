import type { Option } from "../types/option";
import { CheckInput } from "./CheckInput";
import styles from "./CheckQuestion.module.css";

export interface CheckQuestionProps {
	type: "radio" | "checkbox";
	options: Array<Option>;
	onChange: (optionIndex: number, newLabel: string) => void;
	onAdd: () => void;
	onAddOther: () => void;
}

export const CheckQuestion = (props: CheckQuestionProps) => {
	return (
		<div className={styles.container}>
			{props.options.map((option, index) => {
				if (!option.isOther) {
					return (
						<CheckInput
							key={index}
							value={option.label}
							type={props.type}
							themeColor="--comment"
							variant="flushed"
							autoFocus={index === props.options.length - 1 - props.options.filter(option => option.isOther).length}
							onChange={e => props.onChange(index, e.target.value)}
						/>
					);
				}
				if (option.isOther) {
					return <CheckInput key="other" value="其他" type={props.type} variant="none" readOnly />;
				}
			})}
			<div className={styles.addOptions}>
				<CheckInput value="新增選項" type={props.type} variant="none" onClick={props.onAdd} readOnly />
				{!props.options.some(option => option.isOther) && (
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
