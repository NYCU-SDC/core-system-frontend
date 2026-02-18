import { InlineSvg } from "@/shared/components";
import type { FormsScaleOption } from "@nycu-sdc/core-system-sdk";
import { useState } from "react";
import styles from "./ScaleInput.module.css";

interface ScaleInputProps {
	id: string;
	label: string;
	description?: string;
	value: string; // number as string
	options: FormsScaleOption;
	required?: boolean;
	onChange: (value: string) => void;
}

export const ScaleInput = ({ id, label, description, value, options, required, onChange }: ScaleInputProps) => {
	const { minVal, maxVal, minValueLabel, maxValueLabel, icon } = options;
	const [hoverValue, setHoverValue] = useState<number | null>(null);

	const currentValue = value ? parseInt(value, 10) : null;
	const scaleValues = Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);

	const handleClick = (val: number) => {
		onChange(val.toString());
	};

	const renderIcon = (val: number) => {
		const isFilled = (hoverValue !== null && val <= hoverValue) || (currentValue !== null && val <= currentValue);

		if (icon) {
			return <InlineSvg name={icon} filled={isFilled} size={24} />;
		}

		return <span className={styles.value}>{val}</span>;
	};

	return (
		<div className={styles.container}>
			<label htmlFor={id} className={styles.label}>
				{label}
				{required && <span className={styles.required}> *</span>}
			</label>
			{description && <p className={styles.description}>{description}</p>}

			<div className={styles.scaleWrapper}>
				{minValueLabel && <span className={styles.minLabel}>{minValueLabel}</span>}

				<div className={styles.scaleGroup}>
					{scaleValues.map(val => (
						<button
							key={val}
							type="button"
							className={`${styles.scaleButton} ${currentValue !== null && val <= currentValue ? styles.selected : ""} ${hoverValue !== null && val <= hoverValue ? styles.hover : ""}`}
							onClick={() => handleClick(val)}
							onMouseEnter={() => setHoverValue(val)}
							onMouseLeave={() => setHoverValue(null)}
							aria-label={`選擇 ${val}`}
						>
							{renderIcon(val)}
						</button>
					))}
				</div>

				{maxValueLabel && <span className={styles.maxLabel}>{maxValueLabel}</span>}
			</div>
		</div>
	);
};
