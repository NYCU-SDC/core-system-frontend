import { InlineSvg, Input } from "@/shared/components";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Question } from "../../types/option";
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
	onStartLabelChange?: (label: string) => void;
	onEndLabelChange?: (label: string) => void;
}

export const RangeQuestion = (props: RangeQuestionProps) => {
	const [iconKeyword, setIconKeyword] = useState("");
	const [iconNames, setIconNames] = useState<string[]>([]);

	useEffect(() => {
		let isMounted = true;
		fetch("/icons/lucide/names.json")
			.then(res => (res.ok ? res.json() : []))
			.then((names: unknown) => {
				if (!isMounted) return;
				if (Array.isArray(names)) {
					setIconNames(names.filter((name): name is string => typeof name === "string"));
				}
			})
			.catch(() => {
				if (isMounted) setIconNames([]);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const filteredIcons = useMemo(() => {
		const keyword = iconKeyword.trim().toLowerCase();
		if (!keyword) return iconNames;
		return iconNames.filter(icon => icon.includes(keyword));
	}, [iconKeyword, iconNames]);
	const rangeWarning = props.start >= props.end ? "開始值必須小於結束值" : null;
	const startWarning = props.start < 0 || props.start > 1 ? "開始值需為 0 或 1" : null;
	const endWarning = props.end < 2 || props.end > 10 ? "結束值需介於 2 到 10" : null;

	return (
		<>
			<div className={styles.wrapper}>
				<Input type="number" min={0} max={1} value={props.start} onChange={event => props.onStartChange?.(Number(event.target.value))} placeholder="開始" />
				<span>到</span>
				<Input type="number" min={2} max={10} value={props.end} onChange={event => props.onEndChange?.(Number(event.target.value))} placeholder="結束" />
			</div>
			{(rangeWarning || startWarning || endWarning) && <p className={styles.warning}>{rangeWarning ?? startWarning ?? endWarning}</p>}
			{props.hasIcon && (
				<div className={styles.iconPickerSection}>
					<div className={styles.iconSearchWrapper}>
						<Search size={16} className={styles.iconSearchIcon} />
						<Input value={iconKeyword} onChange={event => setIconKeyword(event.target.value)} placeholder="搜尋圖示" variant="flushed" themeColor="--comment" />
					</div>
					<div className={styles.iconGrid}>
						{filteredIcons.map(iconName => (
							<button
								key={iconName}
								type="button"
								className={`${styles.iconGridItem} ${props.icon === iconName ? styles.iconGridItemActive : ""}`}
								onClick={() => props.onChangeIcon?.(iconName as Question["icon"])}
								title={iconName}
							>
								<InlineSvg name={iconName} filled size={18} className={styles.icon} />
							</button>
						))}
					</div>
				</div>
			)}
			<OptionsInput
				type="list"
				placeholder="標籤（選填）"
				variant="flushed"
				listLabel={`${props.start}`}
				themeColor="--comment"
				value={props.startLabel ?? ""}
				onChange={e => props.onStartLabelChange?.(e.target.value)}
			/>
			<OptionsInput
				type="list"
				placeholder="標籤（選填）"
				variant="flushed"
				listLabel={`${props.end}`}
				themeColor="--comment"
				value={props.endLabel ?? ""}
				onChange={e => props.onEndLabelChange?.(e.target.value)}
			/>
		</>
	);
};
