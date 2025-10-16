import React from "react";
import { QuestionTypeLabels } from "@/types/question.ts";
import type { QuestionType } from "@/types/form.ts";

interface AddQuestionPanelProps {
	onAddQuestion: (type: QuestionType) => void;
}

const AddQuestion: React.FC<AddQuestionPanelProps> = ({ onAddQuestion }) => {
	const questionTypes: QuestionType[] = ["short_text", "long_text", "single_choice", "multiple_choice", "date"];

	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 max-w-3xl mt-5">
			<div className="text-lg text-center font-semibold leading-7 mb-4">Add</div>
			<div className="flex justify-center flex-wrap gap-3">
				{questionTypes.map(type => (
					<button
						key={type}
						type="button"
						onClick={() => onAddQuestion(type)}
						className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 hover:bg-slate-200 hover:border-slate-400 active:bg-slate-300 transition-colors"
					>
						{QuestionTypeLabels[type]}
					</button>
				))}
			</div>
		</div>
	);
};

export default AddQuestion;
