import { useMemo } from 'react';
import type { BaseQuestion } from "@/types/form.ts";
import type { Question } from "@/types/question.ts";
import { QuestionItem } from './QuestionItem';

interface QuestionListProps {
	questions: BaseQuestion[];
	isUpdating: boolean;
	isDeleting: boolean;
	onQuestionChange: (questionId: string, updates: Partial<Question>) => void;
	onMoveUp: (questionId: string) => void;
	onMoveDown: (questionId: string) => void;
	onDelete: (questionId: string) => void;
}

export const QuestionList = ({
	questions,
	isUpdating,
	isDeleting,
	onQuestionChange,
	onMoveUp,
	onMoveDown,
	onDelete,
}: QuestionListProps) => {
	// Memoize the question list rendering to prevent DOM recreation
	const content = useMemo(() => {
		if (questions.length === 0) {
			return null;
		}

		return (
			<div className="space-y-5">
				{questions
					.sort((a, b) => a.order - b.order)
					.map((question, index) => (
						<QuestionItem
							key={question.id}
							question={question}
							index={index}
							totalQuestions={questions.length}
							isUpdating={isUpdating}
							isDeleting={isDeleting}
							onQuestionChange={onQuestionChange}
							onMoveUp={onMoveUp}
							onMoveDown={onMoveDown}
							onDelete={onDelete}
						/>
					))}
			</div>
		);
	}, [questions, isUpdating, isDeleting, onQuestionChange, onMoveUp, onMoveDown, onDelete]);

	return content;
};