import type { FormsSection } from "@nycu-sdc/core-system-sdk";
import styles from "./FormStructure.module.css";

interface FormStructureProps {
	sections: FormsSection[];
	currentStep: number;
	onSectionClick: (index: number) => void;
}

export const FormStructure = ({ sections, currentStep, onSectionClick }: FormStructureProps) => {
	return (
		<div className={styles.structure}>
			<div className={styles.structureTitle}>
				<h2>表單結構</h2>
				<p>（可點擊項目返回編輯）</p>
			</div>
			<div className={styles.structureLegendRow}>
				<div className={styles.structureLegend}>
					<span className={styles.structureLegendDotCompleted}></span>
					<p>完成填寫</p>
				</div>
				<div className={styles.structureLegend}>
					<span className={styles.structureLegendDotPending}></span>
					<p>待填寫</p>
				</div>
				<div className={styles.structureLegend}>
					<span className={styles.structureLegendDotCurrent}></span>
					<p>目前位置</p>
				</div>
			</div>
			<div className={styles.workflow}>
				{sections.map((section, index) => (
					<button
						key={section.id}
						type="button"
						className={[styles.workflowButton, index < currentStep ? styles.completed : "", index === currentStep ? styles.active : ""].join(" ")}
						onClick={() => onSectionClick(index)}
					>
						{section.title}
					</button>
				))}
			</div>
		</div>
	);
};
