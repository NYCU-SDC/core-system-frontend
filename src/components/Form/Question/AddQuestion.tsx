import React from 'react';
import { QuestionTypeLabels } from '@/types/question';
import type { QuestionType } from '@/types/question';
import "@/components/Form/FormCard/DraftFormCard.css"

interface AddQuestionPanelProps {
	onAddQuestion: (type: QuestionType) => void;
}

const AddQuestion: React.FC<AddQuestionPanelProps> = ({ onAddQuestion }) => {
	const questionTypes: QuestionType[] = [
		'short_text',
		'long_text',
		'single_choice',
		'multiple_choice',
		'date'
	];

	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mt-5">
			<div className="text-lg text-center font-semibold leading-7 mb-4">Add</div>
			<div className="flex justify-center flex-wrap gap-3">
				{questionTypes.map((type) => (
					<button
						key={type}
						onClick={() => onAddQuestion(type)}
						className="btn btn-primary"
					>{QuestionTypeLabels[type]}</button>
				))}
			</div>
		</div>
	);
};

export default AddQuestion;