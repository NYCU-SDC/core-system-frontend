import type { FormsDateOption } from "@nycu-sdc/core-system-sdk";
import { useState } from "react";
import styles from "./DateInput.module.css";

interface DateInputProps {
	id: string;
	label: string;
	description?: string;
	value: string; // ISO date string like "2024-12-31" or partial like "2024-12" or "2024"
	options: FormsDateOption;
	required?: boolean;
	onChange: (value: string) => void;
}

export const DateInput = ({ id, label, description, value, options, required, onChange }: DateInputProps) => {
	const { hasYear, hasMonth, hasDay, minDate, maxDate } = options;

	// Parse the value into year, month, day
	const parseValue = (val: string) => {
		if (!val) return { year: "", month: "", day: "" };
		const parts = val.split("-");
		return {
			year: parts[0] || "",
			month: parts[1] || "",
			day: parts[2] || ""
		};
	};

	// Use local state to track user input
	const [localValues, setLocalValues] = useState(() => parseValue(value));

	// Build ISO date string from components (no padding during input)
	const buildDateString = (year: string, month: string, day: string) => {
		const parts = [];
		if (hasYear && year) parts.push(year);
		if (hasMonth && month) parts.push(month);
		if (hasDay && day) parts.push(day);
		return parts.join("-");
	};

	const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const year = e.target.value;
		setLocalValues(prev => ({ ...prev, year }));
		onChange(buildDateString(year, localValues.month, localValues.day));
	};

	const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const month = e.target.value;
		setLocalValues(prev => ({ ...prev, month }));
		onChange(buildDateString(localValues.year, month, localValues.day));
	};

	const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const day = e.target.value;
		setLocalValues(prev => ({ ...prev, day }));
		onChange(buildDateString(localValues.year, localValues.month, day));
	};

	// Parse min/max dates for validation
	const getMinConstraints = () => {
		if (!minDate) return {};
		const date = new Date(minDate);
		return {
			minYear: date.getUTCFullYear(),
			minMonth: date.getUTCMonth() + 1,
			minDay: date.getUTCDate()
		};
	};

	const getMaxConstraints = () => {
		if (!maxDate) return {};
		const date = new Date(maxDate);
		return {
			maxYear: date.getUTCFullYear(),
			maxMonth: date.getUTCMonth() + 1,
			maxDay: date.getUTCDate()
		};
	};

	const minConstraints = getMinConstraints();
	const maxConstraints = getMaxConstraints();

	return (
		<div className={styles.container}>
			<label htmlFor={id} className={styles.label}>
				{label}
				{required && <span className={styles.required}> *</span>}
			</label>
			{description && <p className={styles.description}>{description}</p>}

			<div className={styles.inputGroup}>
				{hasYear && (
					<div className={styles.inputWrapper}>
						<input
							type="number"
							id={`${id}-year`}
							className={styles.input}
							placeholder="年 (YYYY)"
							value={localValues.year}
							onChange={handleYearChange}
							min={minConstraints.minYear}
							max={maxConstraints.maxYear}
							required={required}
						/>
						<span className={styles.unit}>年</span>
					</div>
				)}

				{hasMonth && (
					<div className={styles.inputWrapper}>
						<input type="number" id={`${id}-month`} className={styles.input} placeholder="月 (MM)" value={localValues.month} onChange={handleMonthChange} min={1} max={12} required={required} />
						<span className={styles.unit}>月</span>
					</div>
				)}

				{hasDay && (
					<div className={styles.inputWrapper}>
						<input type="number" id={`${id}-day`} className={styles.input} placeholder="日 (DD)" value={localValues.day} onChange={handleDayChange} min={1} max={31} required={required} />
						<span className={styles.unit}>日</span>
					</div>
				)}
			</div>

			{(minDate || maxDate) && (
				<p className={styles.hint}>
					{minDate && maxDate && `範圍：${new Date(minDate).toLocaleDateString("zh-TW")} ~ ${new Date(maxDate).toLocaleDateString("zh-TW")}`}
					{minDate && !maxDate && `最早：${new Date(minDate).toLocaleDateString("zh-TW")}`}
					{!minDate && maxDate && `最晚：${new Date(maxDate).toLocaleDateString("zh-TW")}`}
				</p>
			)}
		</div>
	);
};
