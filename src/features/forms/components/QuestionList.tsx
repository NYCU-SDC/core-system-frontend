import React, { useState } from 'react';
import type { Question, ChoiceOption } from '@/features/forms/types/question.ts';
import { QuestionTypeLabels } from '@/features/forms/types/question.ts';
import "@/features/forms/components/DraftFormCard.css"

interface QuestionListProps {
	questions: Question[];
	onUpdateQuestion: (questionId: string, updatedQuestion: Question) => void;
	onDeleteQuestion: (questionId: string) => void;
	onReorderQuestions: (reorderedQuestions: Question[]) => void;
}

interface QuestionItemProps {
	question: Question;
	index: number;
	onUpdate: (updatedQuestion: Question) => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
													   question,
													   index,
													   onUpdate,
													   onDelete,
													   onMoveUp,
													   onMoveDown,
													   canMoveUp,
													   canMoveDown,
												   }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleFieldChange = (field: string, value: string | number | boolean | undefined) => {
		onUpdate({
			...question,
			[field]: value,
		} as Question);
	};

	const handleOptionChange = (optionIndex: number, field: 'label' | 'value', value: string) => {
		if (question.type === 'single_choice' || question.type === 'multiple_choice') {
			const newOptions = [...question.options];
			newOptions[optionIndex] = {
				...newOptions[optionIndex],
				[field]: value,
			};
			onUpdate({
				...question,
				options: newOptions,
			});
		}
	};

	const addOption = () => {
		if (question.type === 'single_choice' || question.type === 'multiple_choice') {
			const newOption: ChoiceOption = {
				id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				label: '',
				value: '',
			};
			onUpdate({
				...question,
				options: [...question.options, newOption],
			});
		}
	};

	const removeOption = (optionIndex: number) => {
		if (question.type === 'single_choice' || question.type === 'multiple_choice') {
			const newOptions = question.options.filter((_, index) => index !== optionIndex);
			onUpdate({
				...question,
				options: newOptions,
			});
		}
	};

	const renderQuestionTypeSpecificFields = () => {
		switch (question.type) {
			case 'short_text':
				return (
					<div className="space-y-3">
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Placeholder</label>
							<input
								type="text"
								value={question.placeholder || ''}
								onChange={(e) => handleFieldChange('placeholder', e.target.value)}
								placeholder="Enter placeholder text"
								className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Max Length</label>
							<input
								type="number"
								value={question.maxLength || ''}
								onChange={(e) => handleFieldChange('maxLength', parseInt(e.target.value) || undefined)}
								placeholder="100"
								min="1"
								className="text-sm w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
					</div>
				);

			case 'long_text':
				return (
					<div className="space-y-3">
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Placeholder</label>
							<input
								type="text"
								value={question.placeholder || ''}
								onChange={(e) => handleFieldChange('placeholder', e.target.value)}
								placeholder="Enter placeholder text"
								className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Rows</label>
							<input
								type="number"
								value={question.rows || ''}
								onChange={(e) => handleFieldChange('rows', parseInt(e.target.value) || undefined)}
								placeholder="4"
								min="1"
								max="20"
								className="text-sm w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Max Length</label>
							<input
								type="number"
								value={question.maxLength || ''}
								onChange={(e) => handleFieldChange('maxLength', parseInt(e.target.value) || undefined)}
								placeholder="1000"
								min="1"
								className="text-sm w-24 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
					</div>
				);

			case 'single_choice':
			case 'multiple_choice':
				return (
					<div className="space-y-3">
						<div className="flex items-start gap-6">
							<label className="text-sm w-[89px] text-slate-800 pt-2">Options</label>
							<div className="flex-1 space-y-2">
								{question.options.map((option, optionIndex) => (
									<div key={option.id} className="flex items-center gap-2">
										<input
											type="text"
											value={option.label}
											onChange={(e) => handleOptionChange(optionIndex, 'label', e.target.value)}
											placeholder={`Option ${optionIndex + 1}`}
											className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
										/>
										<button
											type="button"
											onClick={() => removeOption(optionIndex)}
											className="text-red-600 hover:text-red-800 p-1"
											disabled={question.options.length <= 1}
										>
											×
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={addOption}
									className="text-sm text-slate-600 hover:text-slate-800 border border-dashed border-slate-300 rounded-md px-3 py-2 w-full"
								>
									+ Add Option
								</button>
							</div>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800"></label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={question.allowOther || false}
									onChange={(e) => handleFieldChange('allowOther', e.target.checked)}
									className="accent-slate-800"
								/>
								<span className="text-sm text-slate-800">Allow "Other" option</span>
							</label>
						</div>
						{question.type === 'multiple_choice' && (
							<>
								<div className="flex items-center gap-6">
									<label className="text-sm w-[89px] text-slate-800">Min Selections</label>
									<input
										type="number"
										value={question.minSelections || ''}
										onChange={(e) => handleFieldChange('minSelections', parseInt(e.target.value) || undefined)}
										placeholder="0"
										min="0"
										className="text-sm w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
									/>
								</div>
								<div className="flex items-center gap-6">
									<label className="text-sm w-[89px] text-slate-800">Max Selections</label>
									<input
										type="number"
										value={question.maxSelections || ''}
										onChange={(e) => handleFieldChange('maxSelections', parseInt(e.target.value) || undefined)}
										placeholder="No limit"
										min="1"
										className="text-sm w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
									/>
								</div>
							</>
						)}
					</div>
				);

			case 'date':
				return (
					<div className="space-y-3">
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Date Format</label>
							<select
								value={question.dateFormat || 'date'}
								onChange={(e) => handleFieldChange('dateFormat', e.target.value)}
								className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							>
								<option value="date">Date only</option>
								<option value="datetime">Date and time</option>
								<option value="time">Time only</option>
							</select>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Min Date</label>
							<input
								type="date"
								value={question.minDate || ''}
								onChange={(e) => handleFieldChange('minDate', e.target.value)}
								className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-6">
							<label className="text-sm w-[89px] text-slate-800">Max Date</label>
							<input
								type="date"
								value={question.maxDate || ''}
								onChange={(e) => handleFieldChange('maxDate', e.target.value)}
								className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<span className="font-semibold text-lg leading-7 text-slate-800">
						Question {index + 1}
					</span>
					<span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
						{QuestionTypeLabels[question.type]}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onMoveUp}
						disabled={!canMoveUp}
						className="p-1 text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
						title="Move up"
					>
						↑
					</button>
					<button
						type="button"
						onClick={onMoveDown}
						disabled={!canMoveDown}
						className="p-1 text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
						title="Move down"
					>
						↓
					</button>
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="p-1 text-slate-600 hover:text-slate-800"
						title={isExpanded ? "Collapse" : "Expand"}
					>
						{isExpanded ? "−" : "+"}
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="p-1 text-red-600 hover:text-red-800"
						title="Delete question"
					>
						×
					</button>
				</div>
			</div>

			{isExpanded && (
				<div className="space-y-4">
					<div className="flex items-center gap-6">
						<label className="text-sm w-[89px] text-slate-800">Title *</label>
						<input
							type="text"
							value={question.title}
							onChange={(e) => handleFieldChange('title', e.target.value)}
							placeholder="Enter question title"
							className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
						/>
					</div>

					<div className="flex items-start gap-6">
						<label className="text-sm w-[89px] text-slate-800 pt-2">Description</label>
						<textarea
							value={question.description || ''}
							onChange={(e) => handleFieldChange('description', e.target.value)}
							placeholder="Enter question description (optional)"
							rows={2}
							className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
						/>
					</div>

					<div className="flex items-center gap-6">
						<label className="text-sm w-[89px] text-slate-800"></label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={question.required}
								onChange={(e) => handleFieldChange('required', e.target.checked)}
								className="accent-slate-800"
							/>
							<span className="text-sm text-slate-800">Required</span>
						</label>
					</div>

					{renderQuestionTypeSpecificFields()}
				</div>
			)}

			{!isExpanded && (
				<div className="text-sm text-slate-600">
					{question.title || 'Untitled question'}
					{question.required && <span className="text-red-500 ml-1">*</span>}
				</div>
			)}
		</div>
	);
};

const QuestionList: React.FC<QuestionListProps> = ({
													   questions,
													   onUpdateQuestion,
													   onDeleteQuestion,
													   onReorderQuestions,
												   }) => {
	const handleMoveUp = (index: number) => {
		if (index > 0) {
			const newQuestions = [...questions];
			[newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];

			// Update order property
			newQuestions.forEach((q, i) => {
				q.order = i;
			});

			onReorderQuestions(newQuestions);
		}
	};

	const handleMoveDown = (index: number) => {
		if (index < questions.length - 1) {
			const newQuestions = [...questions];
			[newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];

			// Update order property
			newQuestions.forEach((q, i) => {
				q.order = i;
			});

			onReorderQuestions(newQuestions);
		}
	};

	if (questions.length === 0) {
		return (
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="text-center py-8 text-slate-500">
					No questions added yet. Click question type in "Add" section to get started.
				</div>
			</div>
		);
	}

	return (
		<div>
			{questions.map((question, index) => (
				<QuestionItem
					key={question.id}
					question={question}
					index={index}
					onUpdate={(updatedQuestion) => onUpdateQuestion(question.id, updatedQuestion)}
					onDelete={() => onDeleteQuestion(question.id)}
					onMoveUp={() => handleMoveUp(index)}
					onMoveDown={() => handleMoveDown(index)}
					canMoveUp={index > 0}
					canMoveDown={index < questions.length - 1}
				/>
			))}
		</div>
	);
};

export default QuestionList;