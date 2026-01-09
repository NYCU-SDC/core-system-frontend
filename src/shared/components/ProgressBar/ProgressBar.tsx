import * as Progress from "@radix-ui/react-progress";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends ComponentPropsWithoutRef<typeof Progress.Root> {
	value: number;
	max?: number;
	label?: string;
	showPercentage?: boolean;
	themeColor?: string;
}

export function ProgressBar({ value, max = 100, label, showPercentage = true, themeColor, className, ...props }: ProgressBarProps) {
	const percentage = Math.round((value / max) * 100);

	return (
		<div className={styles.wrapper}>
			{(label || showPercentage) && (
				<div className={styles.label}>
					{label && <span>{label}</span>}
					{showPercentage && <span className={styles.percentage}>{percentage}%</span>}
				</div>
			)}
			<Progress.Root className={`${styles.root} ${className || ""}`} value={value} max={max} {...props}>
				<Progress.Indicator
					className={styles.indicator}
					style={{
						transform: `translateX(-${100 - percentage}%)`,
						backgroundColor: themeColor || undefined
					}}
				/>
			</Progress.Root>
		</div>
	);
}
