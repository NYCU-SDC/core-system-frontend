import { htmlToMarkdown } from "@/shared/utils/htmlToMarkdown";
import type { FormsDateOption } from "@nycu-sdc/core-system-sdk";
import { useMemo, useState } from "react";
import { Markdown } from "../Markdown/Markdown";
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
	const markdownDescription = useMemo(() => (description ? htmlToMarkdown(description) : ""), [description]);

	// Parse the value into year, month, day
	const parseValue = (val: string) => {
		if (!val) return { year: "", month: "", day: "" };
		const parts = val.split("-");
		return { year: parts[0] || "", month: parts[1] || "", day: parts[2] || "" };
	};

	const [localValues, setLocalValues] = useState(() => parseValue(value));
	const [touched, setTouched] = useState(false);

	// Build ISO date string from components
	const buildDateString = (year: string, month: string, day: string) => {
		const parts: string[] = [];
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

	// Format a UTC ISO timestamp into a human-readable date at the right precision
	const formatConstraintDate = (isoStr: string) => {
		const d = new Date(isoStr);
		const parts: string[] = [];
		if (hasYear) parts.push(d.getUTCFullYear() + "年");
		if (hasMonth) parts.push(d.getUTCMonth() + 1 + "月");
		if (hasDay) parts.push(d.getUTCDate() + "日");
		return parts.join("");
	};

	const getError = (): string | null => {
		const { year, month, day } = localValues;

		// Month range
		if (hasMonth && month) {
			const m = Number(month);
			if (!Number.isInteger(m) || m < 1 || m > 12) return "月份需介於 1 到 12";
		}

		// Day range
		if (hasDay && day) {
			const d = Number(day);
			if (!Number.isInteger(d) || d < 1 || d > 31) return "日期需介於 1 到 31";
			// Check actual days in the given month
			if (hasYear && year && hasMonth && month) {
				const y = Number(year);
				const m = Number(month);
				if (Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12) {
					const daysInMonth = new Date(y, m, 0).getDate();
					if (d > daysInMonth) return `${m} 月只有 ${daysInMonth} 天`;
				}
			}
		}

		// Min/max validation — only once all enabled fields are filled
		const allFilled = (!hasYear || Boolean(year)) && (!hasMonth || Boolean(month)) && (!hasDay || Boolean(day));
		if (!allFilled || !year) return null;

		const y = Number(year);
		const m = hasMonth && month ? Number(month) : 1;
		const d = hasDay && day ? Number(day) : 1;
		if (!Number.isInteger(y) || y < 1) return null;

		if (minDate) {
			const minD = new Date(minDate);
			const [minY, minM, minDt] = [minD.getUTCFullYear(), minD.getUTCMonth() + 1, minD.getUTCDate()];
			const isBefore = hasDay && hasMonth ? Date.UTC(y, m - 1, d) < Date.UTC(minY, minM - 1, minDt) : hasMonth ? y * 100 + m < minY * 100 + minM : y < minY;
			if (isBefore) return `日期不得早於 ${formatConstraintDate(minDate)}`;
		}

		if (maxDate) {
			const maxD = new Date(maxDate);
			const [maxY, maxM, maxDt] = [maxD.getUTCFullYear(), maxD.getUTCMonth() + 1, maxD.getUTCDate()];
			const isAfter = hasDay && hasMonth ? Date.UTC(y, m - 1, d) > Date.UTC(maxY, maxM - 1, maxDt) : hasMonth ? y * 100 + m > maxY * 100 + maxM : y > maxY;
			if (isAfter) return `日期不得晚於 ${formatConstraintDate(maxDate)}`;
		}

		return null;
	};

	const error = touched ? getError() : null;

	return (
		<div className={styles.container}>
			<label htmlFor={id} className={styles.label}>
				{label}
				{required && <span className={styles.required}> *</span>}
			</label>
			{description && <Markdown className={styles.description} content={markdownDescription} />}

			<div className={styles.inputGroup}>
				{hasYear && (
					<div className={styles.inputWrapper}>
						<input
							type="number"
							id={`${id}-year`}
							className={`${styles.input} ${error ? styles.inputError : ""}`}
							placeholder="YYYY"
							value={localValues.year}
							onChange={handleYearChange}
							onBlur={() => setTouched(true)}
							required={required}
						/>
						<span className={styles.unit}>年</span>
					</div>
				)}

				{hasMonth && (
					<div className={styles.inputWrapper}>
						<input
							type="number"
							id={`${id}-month`}
							className={`${styles.input} ${error ? styles.inputError : ""}`}
							placeholder="MM"
							value={localValues.month}
							onChange={handleMonthChange}
							onBlur={() => setTouched(true)}
							min={1}
							max={12}
							required={required}
						/>
						<span className={styles.unit}>月</span>
					</div>
				)}

				{hasDay && (
					<div className={styles.inputWrapper}>
						<input
							type="number"
							id={`${id}-day`}
							className={`${styles.input} ${error ? styles.inputError : ""}`}
							placeholder="DD"
							value={localValues.day}
							onChange={handleDayChange}
							onBlur={() => setTouched(true)}
							min={1}
							max={31}
							required={required}
						/>
						<span className={styles.unit}>日</span>
					</div>
				)}
			</div>

			{(minDate || maxDate) && (
				<p className={styles.hint}>
					{minDate && maxDate && `範圍：${formatConstraintDate(minDate)} ~ ${formatConstraintDate(maxDate)}`}
					{minDate && !maxDate && `最早：${formatConstraintDate(minDate)}`}
					{!minDate && maxDate && `最晚：${formatConstraintDate(maxDate)}`}
				</p>
			)}
			{error && <p className={styles.errorMessage}>{error}</p>}
		</div>
	);
};
