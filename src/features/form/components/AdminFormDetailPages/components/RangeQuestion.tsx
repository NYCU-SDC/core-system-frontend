import { Select } from "@/shared/components";
import { Heart, Star, ThumbsUp } from "lucide-react";
import type { Question } from "../types/option";
import { OptionsInput } from "./OptionsInput";
import styles from "./RangeQuestion.module.css";

export interface RangeQuestionProps {
	start: number;
	end: number;
	startLabel?: string;
	endLabel?: string;
	hasIcon: boolean;
	icon?: string;
	onStartChange?: (newStart: number) => void;
	onEndChange?: (newEnd: number) => void;
	onChangeIcon?: (newIcon: Question["icon"]) => void;
}

export const RangeQuestion = (props: RangeQuestionProps) => {
	return (
		<>
			<div className={styles.wrapper}>
				{props.hasIcon && (
					<Select
						options={[
							{ label: "", value: "STAR", icon: <Star className={styles.icon} /> },
							{ label: "", value: "HEART", icon: <Heart className={styles.icon} /> },
							{ label: "", value: "GOOD", icon: <ThumbsUp className={styles.icon} /> }
						]}
						value={props.icon}
						onValueChange={value => {
							const iconValue = value as Question["icon"];
							if (props.onChangeIcon) {
								props.onChangeIcon(iconValue);
							}
						}}
						placeholder="icon"
					></Select>
				)}
				<Select
					options={[
						{ label: "0", value: "0" },
						{ label: "1", value: "1" }
					]}
					value={props.start.toString()}
					onValueChange={value => props.onStartChange && props.onStartChange(Number(value))}
					placeholder="value"
				></Select>
				<span>到</span>
				<Select
					options={(() => {
						const opts = [];
						for (let i = 2; i <= 10; i++) {
							opts.push({ label: i.toString(), value: i.toString() });
						}
						return opts;
					})()}
					value={props.end.toString()}
					onValueChange={value => props.onEndChange && props.onEndChange(Number(value))}
					placeholder="value"
				></Select>
			</div>
			<OptionsInput type="list" placeholder="標籤（選填）" variant="flushed" listLabel={`${props.start}`} themeColor="--comment" />
			<OptionsInput type="list" placeholder="標籤（選填）" variant="flushed" listLabel={`${props.end}`} themeColor="--comment" />
		</>
	);
};
