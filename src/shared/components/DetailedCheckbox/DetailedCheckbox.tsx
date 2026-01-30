import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";
import styles from "./DetailedCheckbox.module.css";

export interface DetailedCheckboxProps extends ComponentPropsWithoutRef<typeof RadixCheckbox.Root> {
	title: string;
	description: string;
	themeColor?: string;
}

export const DetailedCheckbox = ({ title, description, themeColor, style, id, ...props }: DetailedCheckboxProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [needsExpansion, setNeedsExpansion] = useState(false);

	const checkboxStyle = themeColor ? { ...style, borderColor: themeColor, backgroundColor: props.checked ? themeColor : undefined } : style;

	const handleDescriptionRef = (element: HTMLDivElement | null) => {
		if (element) {
			const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
			const maxHeight = lineHeight * 2;
			setNeedsExpansion(element.scrollHeight > maxHeight);
		}
	};

	const toggleExpansion = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<div className={styles.container}>
			<div className={styles.cornerTopLeft} />
			<div className={styles.cornerBottomRight} />

			<div className={styles.content}>
				{/* 左側 Checkbox */}
				<div className={styles.checkboxWrapper}>
					<RadixCheckbox.Root className={styles.checkbox} style={checkboxStyle} id={id} {...props}>
						<RadixCheckbox.Indicator className={styles.indicator}>
							<Check size={16} />
						</RadixCheckbox.Indicator>
					</RadixCheckbox.Root>
				</div>

				{/* 右側內容 */}
				<div className={styles.textContent}>
					{/* 標題 */}
					<h3 className={styles.title}>{title}</h3>

					{/* 描述區塊 */}
					<div className={styles.descriptionWrapper}>
						<button type="button" className={styles.chevronButton} onClick={toggleExpansion} aria-label={isExpanded ? "收合描述" : "展開描述"}>
							<span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`} />
						</button>
						<div
							className={styles.descriptionContent}
							onClick={toggleExpansion}
							role="button"
							tabIndex={0}
							onKeyDown={e => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									toggleExpansion();
								}
							}}
						>
							<div ref={handleDescriptionRef} className={`${styles.description} ${isExpanded ? styles.descriptionExpanded : ""}`}>
								{description}
							</div>
							{needsExpansion && !isExpanded && <span className={styles.showMoreButton}>...顯示全部</span>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
