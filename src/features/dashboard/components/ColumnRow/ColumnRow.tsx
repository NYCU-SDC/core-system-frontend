import { ScrollContainer } from "@/shared/components";
import type { FormsSectionBundle } from "@nycu-sdc/core-system-sdk";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Eye, EyeOff, Hash, ListChevronsDownUp, ListChevronsUpDown, Square, SquareCheck, X } from "lucide-react";
import { useState } from "react";
import styles from "./ColumnRow.module.css";

interface ColumnRowProps {
	sectionsData: FormsSectionBundle[];
	hiddenQuestionIds: Set<string>;
	onToggleQuestion: (questionId: string) => void;
	onToggleSection: (questionIds: string[], allVisible: boolean) => void;
	isCollapsed: boolean;
	isExiting: boolean;
	onToggleCollapse: () => void;
}

export const ColumnRow = ({ sectionsData, hiddenQuestionIds, onToggleQuestion, onToggleSection, isCollapsed, isExiting, onToggleCollapse }: ColumnRowProps) => {
	const [popoverOpen, setPopoverOpen] = useState(false);

	const sections = sectionsData.map(bundle => ({
		id: bundle.section.id,
		title: bundle.section.title ?? "",
		questions: bundle.questions ?? []
	}));

	const allQuestions = sections.flatMap(s => s.questions);
	const visibleQuestions = allQuestions.filter(q => !hiddenQuestionIds.has(q.id));

	return (
		<div className={styles.columnRow}>
			<PopoverPrimitive.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
				<PopoverPrimitive.Trigger asChild>
					<button type="button" className={styles.headerChip}>
						<span>Column</span>
						<Hash size={16} />
					</button>
				</PopoverPrimitive.Trigger>
				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content className={styles.popoverPanel} side="bottom" align="start" sideOffset={8}>
						<ScrollContainer className={styles.popoverScroll}>
							{sections.map(section => {
								const questionIds = section.questions.map(q => q.id);
								const allVisible = questionIds.every(id => !hiddenQuestionIds.has(id));

								return (
									<div key={section.id} className={styles.sectionGroup}>
										<button type="button" className={`${styles.sectionHeader}${allVisible ? "" : ` ${styles.sectionHeaderPartial}`}`} onClick={() => onToggleSection(questionIds, allVisible)}>
											{allVisible ? <SquareCheck size={16} className={styles.sectionCheckIcon} /> : <Square size={16} className={styles.sectionCheckIcon} />}
											<span>{section.title || "未命名區段"}</span>
										</button>
										<div className={styles.questionChips}>
											{section.questions.map(q => {
												const isHidden = hiddenQuestionIds.has(q.id);
												return (
													<button
														key={q.id}
														type="button"
														title={q.title}
														className={`${styles.questionChip}${isHidden ? ` ${styles.questionChipHidden}` : ""}`}
														onClick={() => onToggleQuestion(q.id)}
													>
														<span className={styles.questionChipText}>{q.title}</span>
														{isHidden ? <EyeOff size={14} className={styles.eyeIcon} /> : <Eye size={14} className={styles.eyeIcon} />}
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</ScrollContainer>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>

			{(!isCollapsed || isExiting) &&
				visibleQuestions.map((q, i) => (
					<div key={q.id} title={q.title} className={`${styles.columnChip}${isExiting ? ` ${styles.columnChipExiting}` : ""}`} style={!isExiting ? { animationDelay: `${i * 0.01}s` } : undefined}>
						<span className={styles.columnChipText}>{q.title}</span>
						<button type="button" className={styles.columnChipRemove} onClick={() => onToggleQuestion(q.id)}>
							<X size={12} />
						</button>
					</div>
				))}

			<button type="button" className={styles.collapseToggle} onClick={onToggleCollapse}>
				<span>{isCollapsed ? "展開" : "收合"}</span>
				{isCollapsed ? <ListChevronsUpDown size={16} /> : <ListChevronsDownUp size={16} />}
			</button>
		</div>
	);
};
