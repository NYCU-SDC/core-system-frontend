import type { Question } from "@/features/form/components/AdminFormDetailPages/types/question";
import { InlineSvg, Input } from "@/shared/components";
import { OptionsInput } from "./OptionsInput";
import styles from "./RangeQuestion.module.css";

const ADMIN_RATING_ICON_OPTIONS = ["star", "heart", "thumbs-up", "smile", "trophy"] as const;

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
	const rangeWarning = props.start >= props.end ? "開始值必須小於結束值" : null;
	const startWarning = props.start < 0 || props.start > 1 ? "開始值需為 0 或 1" : null;
	const endWarning = props.end < 2 || props.end > 10 ? "結束值需介於 2 到 10" : null;
	const selectedIconName = props.icon ?? ADMIN_RATING_ICON_OPTIONS[0];

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
					<div className={styles.iconSelected}>
						<span>選擇圖示：</span>
						<InlineSvg name={selectedIconName} filled size={18} className={styles.iconSelectedPreview} />
						<code className={styles.iconSelectedName}>{selectedIconName}</code>
					</div>
					<div className={styles.iconGrid}>
						{ADMIN_RATING_ICON_OPTIONS.map(iconName => (
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
