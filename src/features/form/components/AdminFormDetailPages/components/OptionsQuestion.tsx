import type { Option } from "@/features/form/components/AdminFormDetailPages/types/question";
import { Select, Switch } from "@/shared/components";
import { X } from "lucide-react";
import { useState } from "react";
import { OptionsInput } from "./OptionsInput";
import styles from "./OptionsQuestion.module.css";

export interface OptionsQuestionProps {
	type: "radio" | "checkbox" | "list";
	options: Array<Option>;
	isFromAnswer: boolean;
	sourceOptions?: Array<{ value: string; label: string }>;
	sourceValue?: string;
	onChange: (optionIndex: number, newLabel: string) => void;
	onAdd: () => void;
	onAddOther: () => void;
	onRemove: (optionIndex: number) => void;
	onRemoveOther: () => void;
	onToggleIsFromAnswer: () => void;
	onSourceChange?: (sourceId: string) => void;
}

interface OptionRowProps {
	option: Option;
	index: number;
	type: "radio" | "checkbox" | "list";
	canRemove: boolean;
	onCommit: (index: number, value: string) => void;
	onRemove: (index: number) => void;
}

const OptionRow = ({ option, index, type, canRemove, onCommit, onRemove }: OptionRowProps) => {
	const [localLabel, setLocalLabel] = useState(option.label);
	return (
		<div className={styles.optionWrapper}>
			<OptionsInput
				value={localLabel}
				type={type}
				themeColor="--comment"
				variant="flushed"
				listLabel={`${index + 1}.`}
				className={styles.optionInput}
				onFocus={e => e.target.select()}
				onChange={e => setLocalLabel(e.target.value)}
				onBlur={() => onCommit(index, localLabel)}
			/>
			{canRemove && <X onClick={() => onRemove(index)} />}
		</div>
	);
};

interface OtherOptionRowProps {
	option: Option;
	index: number;
	type: "radio" | "checkbox" | "list";
	canRemove: boolean;
	onCommit: (index: number, value: string) => void;
	onRemoveOther: () => void;
}

const OtherOptionRow = ({ option, index, type, canRemove, onCommit, onRemoveOther }: OtherOptionRowProps) => {
	const [localLabel, setLocalLabel] = useState(option.label);
	return (
		<div className={styles.optionWrapper}>
			<OptionsInput
				value={localLabel}
				type={type}
				themeColor="--comment"
				variant="flushed"
				listLabel={`${index + 1}.`}
				className={styles.optionInput}
				placeholder="其他（使用者填寫）"
				onFocus={e => e.target.select()}
				onChange={e => setLocalLabel(e.target.value)}
				onBlur={() => onCommit(index, localLabel)}
			/>
			{canRemove && <X onClick={onRemoveOther} />}
		</div>
	);
};

export const OptionsQuestion = (props: OptionsQuestionProps) => {
	return (
		<div className={styles.container}>
			{!props.isFromAnswer && (
				<>
					{props.options.map((option, index) => {
						if (!option.isOther) {
							return <OptionRow key={option.id ?? index} option={option} index={index} type={props.type} canRemove={props.options.length > 1} onCommit={props.onChange} onRemove={props.onRemove} />;
						}
						if (option.isOther) {
							return (
								<OtherOptionRow
									key={option.id ?? index}
									option={option}
									index={index}
									type={props.type}
									canRemove={props.options.length > 1}
									onCommit={props.onChange}
									onRemoveOther={props.onRemoveOther}
								/>
							);
						}
					})}
					<div className={styles.addOptions}>
						<OptionsInput value="新增選項" type={props.type} variant="none" onClick={props.onAdd} listLabel={`${props.options.length + 1}.`} readOnly className={styles.addOption} />
						{!props.options.some(option => option.isOther) && props.type !== "list" && (
							<>
								或
								<a className={styles.addOther} onClick={props.onAddOther}>
									新增其他
								</a>
							</>
						)}
					</div>
				</>
			)}
			{props.isFromAnswer && <Select placeholder="從回答選項中選擇" options={props.sourceOptions ?? []} value={props.sourceValue} onValueChange={value => props.onSourceChange?.(value)} />}
			<div className={styles.wrapper}>
				<p>問題來自答案</p>
				<Switch checked={props.isFromAnswer} onCheckedChange={props.onToggleIsFromAnswer} />
			</div>
		</div>
	);
};
