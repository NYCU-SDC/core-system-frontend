import { memo } from "react";
import type { BaseQuestion } from "@/types/form.ts";
import type { Question } from "@/types/question.ts";
import { QuestionTypeLabels } from "@/types/question.ts";

interface QuestionItemProps {
	question: BaseQuestion;
	index: number;
	totalQuestions: number;
	isUpdating: boolean;
	isDeleting: boolean;
	onQuestionChange: (questionId: string, updates: Partial<Question>) => void;
	onMoveUp: (questionId: string) => void;
	onMoveDown: (questionId: string) => void;
	onDelete: (questionId: string) => void;
}

// Memoized Question Item Component to prevent unnecessary re-renders
// Custom comparison function to prevent re-renders when question content hasn't changed
export const QuestionItem = memo<QuestionItemProps>(
	({ question, index, totalQuestions, isUpdating, isDeleting, onQuestionChange, onMoveUp, onMoveDown, onDelete }) => {
		const isFirst = index === 0;
		const isLast = index === totalQuestions - 1;
		const hasChoices = question.type === "single_choice" || question.type === "multiple_choice";

		const handleAddChoice = () => {
			const currentChoices = question.choices || [];
			const newChoice = {
				id: `choice_temp_${Date.now()}`,
				name: `Choice ${currentChoices.length + 1}`
			};
			onQuestionChange(question.id, {
				choices: [...currentChoices, newChoice]
			});
		};

		const handleUpdateChoice = (choiceId: string, newName: string) => {
			const updatedChoices = (question.choices || []).map(choice => (choice.id === choiceId ? { ...choice, name: newName } : choice));
			onQuestionChange(question.id, { choices: updatedChoices });
		};

		const handleDeleteChoice = (choiceId: string) => {
			const updatedChoices = (question.choices || []).filter(choice => choice.id !== choiceId);
			onQuestionChange(question.id, { choices: updatedChoices });
		};

		return (
			<div className="bg-white border border-slate-300 rounded-md p-6 max-w-3xl">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<span className="font-medium text-base mb-5 text-slate-800">{QuestionTypeLabels[question.type]}</span>
						</div>
						<div className="max-w-xl">
							<div className="flex items-center gap-6 mb-3">
								<label className="text-sm w-[89px] text-slate-800">Title</label>
								<textarea
									value={question?.title || ""}
									onChange={e => {
										onQuestionChange(question.id, { title: e.target.value });
									}}
									placeholder="Enter question title"
									rows={1}
									className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
								/>
							</div>
							<div className="flex items-center gap-6 mb-3">
								<label className="text-sm w-[89px] text-slate-800">Description</label>
								<textarea
									value={question.description || ""}
									onChange={e => {
										onQuestionChange(question.id, { description: e.target.value });
									}}
									placeholder="Enter question description (optional)"
									rows={2}
									className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
								/>
							</div>

							{/* Choice Options Editor */}
							{hasChoices && (
								<div className="flex gap-6 mb-3">
									<label className="text-sm w-[89px] text-slate-800 pt-2">Options</label>
									<div className="flex-1">
										{(question.choices || []).map((choice, idx) => (
											<div
												key={choice.id}
												className="flex items-center gap-2 mb-2"
											>
												<span className="text-sm text-slate-600 w-6">{idx + 1}.</span>
												<input
													type="text"
													value={choice.name}
													onChange={e => handleUpdateChoice(choice.id, e.target.value)}
													placeholder={`Option ${idx + 1}`}
													className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-slate-900"
												/>
												<button
													type="button"
													onClick={() => handleDeleteChoice(choice.id)}
													className="p-1 text-gray-400 hover:text-red-600 transition-colors"
													title="Delete option"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										))}
										<button
											type="button"
											onClick={handleAddChoice}
											className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 border border-dashed border-slate-300 rounded-md w-full transition-colors"
										>
											+ Add Option
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="flex gap-2 ml-4">
						<button
							type="button"
							onClick={() => onMoveUp(question.id)}
							disabled={isFirst || isUpdating}
							className={`p-1 transition-colors ${isFirst || isUpdating ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-slate-800 cursor-pointer"}`}
							title="Move up"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 15l7-7 7 7"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={() => onMoveDown(question.id)}
							disabled={isLast || isUpdating}
							className={`p-1 transition-colors ${isLast || isUpdating ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-slate-800 cursor-pointer"}`}
							title="Move down"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={() => onDelete(question.id)}
							className="p-1 text-gray-400 hover:text-red-600 transition-colors"
							disabled={isDeleting}
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison: only re-render if these specific values change
		// We compare data props, not function props (functions are stable from parent)

		// First, check if this is the same question
		if (prevProps.question.id !== nextProps.question.id) {
			return false; // Different question, must re-render
		}

		const prevChoices = prevProps.question.choices || [];
		const nextChoices = nextProps.question.choices || [];

		// Check if choices array has changed
		const choicesEqual = prevChoices.length === nextChoices.length && prevChoices.every((choice, idx) => choice.id === nextChoices[idx]?.id && choice.name === nextChoices[idx]?.name);

		// Return true if nothing changed (prevents re-render)
		// Return false if something changed (triggers re-render)
		return (
			prevProps.question.title === nextProps.question.title &&
			prevProps.question.description === nextProps.question.description &&
			prevProps.question.type === nextProps.question.type &&
			prevProps.question.order === nextProps.question.order &&
			choicesEqual &&
			prevProps.index === nextProps.index &&
			prevProps.totalQuestions === nextProps.totalQuestions &&
			prevProps.isUpdating === nextProps.isUpdating &&
			prevProps.isDeleting === nextProps.isDeleting
			// Don't compare function props - they should be stable from parent via useCallback
		);
	}
);

QuestionItem.displayName = "QuestionItem";
