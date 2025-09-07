import React, { useState } from 'react';
import { type Question, QuestionTypeLabels, type SingleChoiceQuestion, type MultipleChoiceQuestion, type ChoiceOption } from "@/types/question";
import "@/components/Form/FormCard/DraftFormCard.css"

interface QuestionListProps {
	questions: Question[];
	onUpdateQuestion: (questionId: string, updatedQuestion: Question) => void;
	onDeleteQuestion: (questionId: string) => void;
	onReorderQuestions: (questions: Question[]) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
	questions,
	onUpdateQuestion,
	onDeleteQuestion,
	onReorderQuestions
}) => {
	if (questions.length === 0) {
		return null;
	}

	const moveQuestionUp = (questionId: string) => {
		const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
		const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

		if (currentIndex > 0) {
			const updatedQuestions = [...sortedQuestions];
			const temp = updatedQuestions[currentIndex].order;
			updatedQuestions[currentIndex].order = updatedQuestions[currentIndex - 1].order;
			updatedQuestions[currentIndex - 1].order = temp;

			onReorderQuestions(updatedQuestions);
		}
	};

	const moveQuestionDown = (questionId: string) => {
		const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
		const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);

		if (currentIndex < sortedQuestions.length - 1) {
			const updatedQuestions = [...sortedQuestions];
			const temp = updatedQuestions[currentIndex].order;
			updatedQuestions[currentIndex].order = updatedQuestions[currentIndex + 1].order;
			updatedQuestions[currentIndex + 1].order = temp;

			onReorderQuestions(updatedQuestions);
		}
	};

	const addOption = (questionId: string, newOptionLabel: string) => {
		const question = questions.find(q => q.id === questionId);
		if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
			return;
		}

		const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
		const newOption: ChoiceOption = {
			id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			label: newOptionLabel,
			value: newOptionLabel.toLowerCase().replace(/\s+/g, '_')
		};

		const updatedQuestion = {
			...choiceQuestion,
			options: [...choiceQuestion.options, newOption]
		};

		onUpdateQuestion(questionId, updatedQuestion);
	};

	const removeOption = (questionId: string, optionId: string) => {
		const question = questions.find(q => q.id === questionId);
		if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
			return;
		}

		const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
		const updatedQuestion = {
			...choiceQuestion,
			options: choiceQuestion.options.filter(option => option.id !== optionId)
		};

		onUpdateQuestion(questionId, updatedQuestion);
	};

	const updateOption = (questionId: string, optionId: string, newLabel: string) => {
		const question = questions.find(q => q.id === questionId);
		if (!question || (question.type !== 'single_choice' && question.type !== 'multiple_choice')) {
			return;
		}

		const choiceQuestion = question as SingleChoiceQuestion | MultipleChoiceQuestion;
		const updatedQuestion = {
			...choiceQuestion,
			options: choiceQuestion.options.map(option =>
				option.id === optionId
					? { ...option, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, '_') }
					: option
			)
		};

		onUpdateQuestion(questionId, updatedQuestion);
	};

	const OptionEditor: React.FC<{ question: SingleChoiceQuestion | MultipleChoiceQuestion }> = ({ question }) => {
		const [newOptionText, setNewOptionText] = useState('');

		const handleAddOption = () => {
			if (newOptionText.trim()) {
				addOption(question.id, newOptionText.trim());
				setNewOptionText('');
			}
		};

		const handleKeyPress = (e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleAddOption();
			}
		};

		return (
			<div className="flex gap-6 mb-3 w-[600px]">
				<label className="text-sm w-[89px] text-slate-800 pt-0.5">Options</label>
				<div className="flex flex-col gap-3">
					{question.options.map((option) => (
						<div key={option.id} className="flex items-center gap-2 md-3 w-[387.5px]">
							<textarea
								value={option.label}
								onChange={(e) => updateOption(question.id, option.id, e.target.value)}
								rows={1}
								className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
							<button
								onClick={() => removeOption(question.id, option.id)}
								className="p-1 text-gray-400 hover:text-black transition-colors -ml-10"
								title="Delete option"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					))}
					<div className="flex gap-3">
						<textarea
							value={newOptionText}
							onChange={(e) => setNewOptionText(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Add an option..."
							rows={1}
							className="w-[396px] text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
						/>
						<button
							onClick={handleAddOption}
							disabled={!newOptionText.trim()}
							className={`px-3 py-2 text-xs rounded transition-colors ${
								newOptionText.trim()
									? 'btn btn-secondary'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
						>Add</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-5">
			{questions
				.sort((a, b) => a.order - b.order)
				.map((question, index) => {
					const isFirst = index === 0;
					const isLast = index === questions.length - 1;
					return (
						<div
							key={question.id}
							className="bg-white border border-slate-300 rounded-md p-6 w-[800px]"
						>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
									<span className="font-medium text-base mb-5 text-slate-800">
                    					{QuestionTypeLabels[question.type]}
                  					</span>
									</div>
									<div className="w-[508px]">
										<div className="flex items-center gap-6 mb-3">
											<label className="text-sm w-[89px] text-slate-800">Title</label>
											<input
												type="text"
												value={question.title}
												onChange={(e) => {
													onUpdateQuestion(question.id, {
														...question,
														title: e.target.value
													});
												}}
												placeholder="Enter question title"
												className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
											/>
										</div>
										<div className="flex items-center gap-6 mb-3">
											<label className="text-sm w-[89px] text-slate-800">Description</label>
											<textarea
												value={question.description || ''}
												onChange={(e) => {
													onUpdateQuestion(question.id, {
														...question,
														description: e.target.value
													});
												}}
												placeholder="Enter question description (optional)"
												rows={2}
												className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
											/>
										</div>
										{(question.type === 'single_choice' || question.type === 'multiple_choice') && (
											<OptionEditor question={question as SingleChoiceQuestion | MultipleChoiceQuestion} />
										)}
									</div>
								</div>
								<div className="flex gap-2 ml-4">
									<button
										onClick={() => moveQuestionUp(question.id)}
										disabled={isFirst}
										className={`p-1 transition-colors ${
											isFirst
												? 'text-gray-300 cursor-not-allowed'
												: 'text-gray-400 hover:text-slate-800 cursor-pointer'
										}`}
										title="Move up"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												  d="M5 15l7-7 7 7" />
										</svg>
									</button>
									<button
										onClick={() => moveQuestionDown(question.id)}
										disabled={isLast}
										className={`p-1 transition-colors ${
											isLast
												? 'text-gray-300 cursor-not-allowed'
												: 'text-gray-400 hover:text-slate-800 cursor-pointer'
										}`}
										title="Move down"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												  d="M19 9l-7 7-7-7" />
										</svg>
									</button>
									<button
										onClick={() => onDeleteQuestion(question.id)}
										className="p-1 text-gray-400 hover:text-red-600 transition-colors"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					);
			})}
		</div>
	);
};

export default QuestionList;