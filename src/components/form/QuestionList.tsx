// import React, { useEffect, useState, useRef } from 'react';
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { type Question, QuestionTypeLabels, type SingleChoiceQuestion, type MultipleChoiceQuestion, type ChoiceOption } from "@/types/question.ts";
// import "@/components/form/DraftFormCard.css"
// import type { BaseQuestion, QuestionType } from "@/types/form.ts";
// import { updateQuestion } from "@/lib/request/updateQuestion.ts";
// import { deleteQuestion } from "@/lib/request/deleteQuestion.ts";
// //import { useParams } from "react-router-dom";
//
// interface QuestionListProps {
// 	formId?: string;
// 	questions: BaseQuestion[];
// 	onUpdateQuestion: (questionId: string, updatedQuestion: Question) => void;
// 	onDeleteQuestion: (questionId: string) => void;
// 	onReorderQuestions: (questions: Question[]) => void;
// 	onFlushUpdates?: () => void;
// }
//
// const QuestionList: React.FC<QuestionListProps> = ({
// 													   formId,
// 													   questions,
// 													   onUpdateQuestion,
// 													   onDeleteQuestion,
// 													   onReorderQuestions,
// 													   onFlushUpdates
// 												   }) => {
//
// 	const queryClient = useQueryClient();
// 	const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
// 	const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
//
// 	const pendingUpdates = useRef<Map<string, BaseQuestion>>(new Map());
// 	const AUTO_SAVE_INTERVAL = 30000;
//
// 	const updateQuestionMutation = useMutation({
// 		mutationFn: (data: { formId: string, questionId: string, request: {
// 				required: boolean,
// 				type: QuestionType,
// 				title: string,
// 				description: string,
// 				order: number,
// 				choices?: ChoiceOption[]
// 			} }) =>
// 			updateQuestion(data.formId, data.questionId, data.request),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['Questions', formId] });
// 		},
// 		onError: (error) => {
// 			console.error('Failed to update question:', error);
// 		}
// 	})
//
// 	const deleteQuestionMutation = useMutation({
// 		mutationFn: (data: { formId: string; questionId: string }) =>
// 			deleteQuestion(data.formId, data.questionId),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['Questions', formId] });
// 		},
// 		onError: (error) => {
// 			console.error('Failed to delete question:', error);
// 		}
// 	});
//
// 	const saveToLocalStorage = () => {
// 		if (!formId) return;
//
// 		try {
// 			const localStorageKey = `form_${formId}_questions`;
// 			const updatesToSave = Array.from(pendingUpdates.current.values());
//
// 			if (updatesToSave.length > 0) {
// 				localStorage.setItem(localStorageKey, JSON.stringify({
// 					timestamp: Date.now(),
// 					questions: updatesToSave
// 				}));
// 				console.log(`Auto-saved ${updatesToSave.length} questions to localStorage`);
// 			}
// 		} catch (error) {
// 			console.error('Failed to save to localStorage:', error);
// 		}
// 	};
//
// 	const loadFromLocalStorage = () => {
// 		if (!formId) return null;
//
// 		try {
// 			const localStorageKey = `form_${formId}_questions`;
// 			const saved = localStorage.getItem(localStorageKey);
//
// 			if (saved) {
// 				const data = JSON.parse(saved);
// 				console.log(`Loaded ${data.questions?.length || 0} questions from localStorage`);
// 				return data;
// 			}
// 		} catch (error) {
// 			console.error('Failed to load from localStorage:', error);
// 		}
//
// 		return null;
// 	};
//
// 	const clearLocalStorage = () => {
// 		if (!formId) return;
//
// 		try {
// 			const localStorageKey = `form_${formId}_questions`;
// 			localStorage.removeItem(localStorageKey);
// 			pendingUpdates.current.clear();
// 			console.log('Cleared localStorage');
// 		} catch (error) {
// 			console.error('Failed to clear localStorage:', error);
// 		}
// 	};
//
// 	useEffect(() => {
// 		const savedData = loadFromLocalStorage();
// 		if (savedData && savedData.questions) {
// 			savedData.questions.forEach((q: BaseQuestion) => {
// 				pendingUpdates.current.set(q.id, q);
// 			});
// 		}
// 	}, [formId]);
//
// 	useEffect(() => {
// 		autoSaveInterval.current = setInterval(() => {
// 			saveToLocalStorage();
// 		}, AUTO_SAVE_INTERVAL);
//
// 		return () => {
// 			if (autoSaveInterval.current) {
// 				clearInterval(autoSaveInterval.current);
// 			}
// 			saveToLocalStorage();
// 		};
// 	}, [formId]);
//
// 	useEffect(() => {
// 		return () => {
// 			Object.values(updateTimers.current).forEach(timer => clearTimeout(timer));
// 		};
// 	}, []);
//
// 	useEffect(() => {
// 		if (onFlushUpdates) {
// 			(window as any).__flushQuestionUpdates = async () => {
// 				if (!formId || pendingUpdates.current.size === 0) return;
// 				const updates = Array.from(pendingUpdates.current.values());
// 				try {
// 					await Promise.all(
// 						updates.map(question =>
// 							updateQuestionMutation.mutateAsync({
// 								formId,
// 								questionId: question.id,
// 								request: {
// 									required: question.required,
// 									type: question.type,
// 									title: question.title,
// 									description: question.description || '',
// 									order: question.order,
// 									choices: (question as any).choices
// 								}
// 							})
// 						)
// 					);
// 					clearLocalStorage();
// 					console.log('Successfully flushed all updates to server');
// 				} catch (error) {
// 					console.error('Failed to flush updates:', error);
// 				}
// 			};
// 		}
//
// 		return () => {
// 			delete (window as any).__flushQuestionUpdates;
// 		};
// 	}, [formId, onFlushUpdates]);
//
// 	const handleQuestionUpdate = (questionId: string, field: keyof BaseQuestion, value: any) => {
// 		const question = questions.find(q => q.id === questionId);
// 		if (!question) return;
//
// 		const updatedQuestion = { ...question, [field]: value };
//
// 		onUpdateQuestion(questionId, updatedQuestion as Question);
// 		pendingUpdates.current.set(questionId, updatedQuestion as BaseQuestion);
//
// 		if (updateTimers.current[questionId]) {
// 			clearTimeout(updateTimers.current[questionId]);
// 		}
//
// 		updateTimers.current[questionId] = setTimeout(() => {
// 			saveToLocalStorage();
// 		}, 1000);
// 	};
//
// 	const handleDeleteQuestion = async (questionId: string) => {
// 		if (!formId) return;
//
// 		try {
// 			await deleteQuestionMutation.mutateAsync({ formId, questionId });
// 			onDeleteQuestion(questionId);
// 			pendingUpdates.current.delete(questionId);
// 			saveToLocalStorage();
// 		} catch (error) {
// 			console.error('Failed to delete question:', error);
// 		}
// 	};
//
// 	const [newOptionText, setNewOptionText] = useState('');
//
// 	const updateOption = (questionId: string, optionId: string, value: string) => {
// 		const question = questions.find(q => q.id === questionId) as SingleChoiceQuestion | MultipleChoiceQuestion;
// 		if (!question || !('choices' in question)) return;
//
// 		const updatedChoices = question.choices.map(opt =>
// 			opt.id === optionId ? { ...opt, value } : opt
// 		);
//
// 		handleQuestionUpdate(questionId, 'choices', updatedChoices);
// 	};
//
// 	const removeOption = (questionId: string, optionId: string) => {
// 		const question = questions.find(q => q.id === questionId) as SingleChoiceQuestion | MultipleChoiceQuestion;
// 		if (!question || !('choices' in question)) return;
//
// 		const updatedChoices = question.choices.filter(opt => opt.id !== optionId);
// 		handleQuestionUpdate(questionId, 'choices', updatedChoices);
// 	};
//
// 	const addOption = (questionId: string) => {
// 		if (!newOptionText.trim()) return;
//
// 		const question = questions.find(q => q.id === questionId) as SingleChoiceQuestion | MultipleChoiceQuestion;
// 		if (!question || !('choices' in question)) return;
//
// 		const newOption: ChoiceOption = {
// 			id: `option-${Date.now()}`,
// 			name: newOptionText.trim(),
// 			//order: question.choices.length
// 		};
//
// 		handleQuestionUpdate(questionId, 'choices', [...question.choices, newOption]);
// 		setNewOptionText('');
// 	};
//
// 	const handleKeyPress = (e: React.KeyboardEvent, questionId: string) => {
// 		if (e.key === 'Enter' && !e.shiftKey) {
// 			e.preventDefault();
// 			addOption(questionId);
// 		}
// 	};
//
// 	const handleAddOption = (questionId: string) => {
// 		addOption(questionId);
// 	};
//
// 	if (questions.length === 0) {
// 		return null;
// 	}
//
// 	const moveQuestionUp = async (questionId: string) => {
// 		const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
// 		const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
//
// 		if (currentIndex > 0) {
// 			const updatedQuestions = [...sortedQuestions];
// 			const temp = updatedQuestions[currentIndex].order;
// 			updatedQuestions[currentIndex].order = updatedQuestions[currentIndex - 1].order;
// 			updatedQuestions[currentIndex - 1].order = temp;
//
// 			pendingUpdates.current.set(updatedQuestions[currentIndex].id, updatedQuestions[currentIndex]);
// 			pendingUpdates.current.set(updatedQuestions[currentIndex - 1].id, updatedQuestions[currentIndex - 1]);
//
// 			onReorderQuestions(updatedQuestions as Question[]);
// 			saveToLocalStorage();
// 		}
// 	};
//
// 	const moveQuestionDown = async (questionId: string) => {
// 		const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
// 		const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
//
// 		if (currentIndex < sortedQuestions.length - 1) {
// 			const updatedQuestions = [...sortedQuestions];
// 			const temp = updatedQuestions[currentIndex].order;
// 			updatedQuestions[currentIndex].order = updatedQuestions[currentIndex + 1].order;
// 			updatedQuestions[currentIndex + 1].order = temp;
//
// 			pendingUpdates.current.set(updatedQuestions[currentIndex].id, updatedQuestions[currentIndex]);
// 			pendingUpdates.current.set(updatedQuestions[currentIndex + 1].id, updatedQuestions[currentIndex + 1]);
//
// 			onReorderQuestions(updatedQuestions as Question[]);
// 			saveToLocalStorage();
// 		}
// 	};
//
// 	const OptionEditor = ({ question }: { question: SingleChoiceQuestion | MultipleChoiceQuestion }) => {
// 		return (
// 			<div className="mt-4">
// 				<label className="text-sm text-slate-800 mb-2 block">Options</label>
// 				<div className="space-y-2">
// 					{question.choices.map((option: ChoiceOption) => (
// 						<div key={option.id} className="flex items-center gap-2">
// 							<textarea
// 								value={option.name}
// 								onChange={(e) => updateOption(question.id, option.id, e.target.value)}
// 								rows={1}
// 								className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
// 							/>
// 							<button
// 								onClick={() => removeOption(question.id, option.id)}
// 								className="p-1 text-gray-400 hover:text-black transition-colors -ml-10"
// 								title="Delete option"
// 							>
// 								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// 								</svg>
// 							</button>
// 						</div>
// 					))}
// 					<div className="flex gap-3">
// 						<textarea
// 							value={newOptionText}
// 							onChange={(e) => setNewOptionText(e.target.value)}
// 							onKeyPress={(e) => handleKeyPress(e, question.id)}
// 							placeholder="Add an option..."
// 							rows={1}
// 							className="w-[396px] text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
// 						/>
// 						<button
// 							onClick={() => handleAddOption(question.id)}
// 						>
// 							Add
// 						</button>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	};
//
// 	return (
// 		<div className="space-y-5">
// 			{questions
// 				.sort((a, b) => a.order - b.order)
// 				.map((question, index) => {
// 					const isFirst = index === 0;
// 					const isLast = index === questions.length - 1;
// 					const isUpdating = updateQuestionMutation.isPending;
// 					const isDeleting = deleteQuestionMutation.isPending;
//
// 					return (
// 						<div
// 							key={question.id}
// 							className="bg-white border border-slate-300 rounded-md p-6 w-[800px]"
// 						>
// 							<div className="flex justify-between items-start">
// 								<div className="flex-1">
// 									<div className="flex items-center gap-2 mb-2">
// 										<span className="font-medium text-base mb-5 text-slate-800">
// 											{QuestionTypeLabels[question.type]}
// 										</span>
// 									</div>
// 									<div className="w-[508px]">
// 										<div className="flex items-center gap-6 mb-3">
// 											<label className="text-sm w-[89px] text-slate-800">Title</label>
// 											<textarea
// 												value={question?.title || ''}
// 												onChange={(e) => {
// 													handleQuestionUpdate(question.id, 'title', e.target.value);
// 												}}
// 												placeholder="Enter question title"
// 												rows={1}
// 												className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
// 												disabled={isUpdating}
// 											/>
// 										</div>
// 										<div className="flex items-center gap-6 mb-3">
// 											<label className="text-sm w-[89px] text-slate-800">Description</label>
// 											<textarea
// 												value={question.description || ''}
// 												onChange={(e) => {
// 													handleQuestionUpdate(question.id, 'description', e.target.value);
// 												}}
// 												placeholder="Enter question description (optional)"
// 												rows={2}
// 												className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
// 												disabled={isUpdating}
// 											/>
// 										</div>
// 										{(question.type === 'single_choice' || question.type === 'multiple_choice') && (
// 											<OptionEditor question={question as SingleChoiceQuestion | MultipleChoiceQuestion} />
// 										)}
// 									</div>
// 								</div>
// 								<div className="flex gap-2 ml-4">
// 									<button
// 										onClick={() => moveQuestionUp(question.id)}
// 										disabled={isFirst || isUpdating}
// 										className={`p-1 transition-colors ${
// 											isFirst || isUpdating
// 												? 'text-gray-300 cursor-not-allowed'
// 												: 'text-gray-400 hover:text-slate-800 cursor-pointer'
// 										}`}
// 										title="Move up"
// 									>
// 										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
// 												  d="M5 15l7-7 7 7" />
// 										</svg>
// 									</button>
// 									<button
// 										onClick={() => moveQuestionDown(question.id)}
// 										disabled={isLast || isUpdating}
// 										className={`p-1 transition-colors ${
// 											isLast || isUpdating
// 												? 'text-gray-300 cursor-not-allowed'
// 												: 'text-gray-400 hover:text-slate-800 cursor-pointer'
// 										}`}
// 										title="Move down"
// 									>
// 										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
// 												  d="M19 9l-7 7-7-7" />
// 										</svg>
// 									</button>
// 									<button
// 										onClick={() => handleDeleteQuestion(question.id)}
// 										className="p-1 text-gray-400 hover:text-red-600 transition-colors"
// 										disabled={isDeleting}
// 									>
// 										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
// 												  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
// 										</svg>
// 									</button>
// 								</div>
// 							</div>
// 						</div>
// 					);
// 				})}
// 		</div>
// 	);
// };
//
// export default QuestionList;