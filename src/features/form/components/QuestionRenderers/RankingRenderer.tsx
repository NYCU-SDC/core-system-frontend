import { DragToOrder } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import styles from "../FormFilloutPage.module.css";

export const RankingRenderer = ({
	question,
	value,
	sourceQuestion,
	sourceAnswerValue,
	onAnswerChange
}: {
	question: FormsQuestionResponse;
	value: string;
	sourceQuestion?: FormsQuestionResponse;
	sourceAnswerValue?: string;
	onAnswerChange: (questionId: string, value: string) => void;
}) => {
	const isFromAnswerRanking = Boolean(question.sourceId);
	const rankingChoices = question.choices?.length ? question.choices : (sourceQuestion?.choices ?? []);
	const sourceSelectedIds = sourceAnswerValue ? sourceAnswerValue.split(",").filter(Boolean) : [];
	const shouldWaitSourceSelection = isFromAnswerRanking && sourceSelectedIds.length === 0;
	const allowedIds = sourceSelectedIds.length > 0 ? sourceSelectedIds : rankingChoices.map(choice => choice.id);
	const currentRankingIds = value
		? value
				.split(",")
				.filter(Boolean)
				.filter(id => allowedIds.includes(id))
		: [];
	const missingIds = allowedIds.filter(id => !currentRankingIds.includes(id));
	const displayIds = [...currentRankingIds, ...missingIds];
	return (
		<>
			{shouldWaitSourceSelection ? (
				<p className={styles.caption}>請先在「{sourceQuestion?.title || "來源題目"}」選擇至少一個項目，才可進行排序。</p>
			) : (
				<DragToOrder
					items={displayIds.map(choiceId => {
						const choice = rankingChoices.find(c => c.id === choiceId);
						return {
							id: choiceId,
							content: choice?.name || choiceId
						};
					})}
					onReorder={items => {
						onAnswerChange(question.id, items.map(item => item.id).join(","));
					}}
				/>
			)}
		</>
	);
};
