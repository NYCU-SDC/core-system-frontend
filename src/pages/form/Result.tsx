import React from "react";
import type { answer as Answer } from "@/types/question.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getForm } from "@/lib/request/getForm.ts";
import { getQuestions } from "@/lib/request/getQuestions";
import { getResponses } from "@/lib/request/getResponses";
import { getQuestionResponses } from "@/lib/request/getQuestionResponses";

const FormResults: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { slug } = useParams<{ slug: string }>();

	const { data: formData, isLoading: isFormLoading } = useQuery({
		queryKey: ["form", id],
		queryFn: () => getForm(id!),
		enabled: !!id
	});

	const { data: questionsData, isLoading: isQuestionsLoading } = useQuery({
		queryKey: ["questions", id],
		queryFn: () => getQuestions(id!),
		enabled: !!id
	});

	const { data: responsesData, isLoading: isResponsesLoading } = useQuery({
		queryKey: ["responses", id],
		queryFn: () => getResponses(id!),
		enabled: !!id
	});

	const questionAnswersQueries = useQueries({
		queries: (questionsData || []).map(question => ({
			queryKey: ["questionAnswers", id, question.id],
			queryFn: () => getQuestionResponses(id!, question.id),
			enabled: !!id && !!question.id
		}))
	});

	const handleBackToForms = () => {
		navigate(`/${slug}/forms`);
	};

	const isLoading = isFormLoading || isQuestionsLoading || isResponsesLoading || questionAnswersQueries.some(q => q.isLoading);

	if (isLoading) {
		return (
			<div className="p-10">
				<div className="flex justify-center items-center h-64">
					<p className="text-gray-600">Loading result...</p>
				</div>
			</div>
		);
	}

	const pageTitle = `Result - ${formData?.title || "Loading..."}`;

	const totalResponses = responsesData?.responses?.length || 0;
	const respondents = responsesData?.responses?.map(r => r.submittedBy) || [];
	const uniqueRespondents = Array.from(new Set(respondents));
	const questions = questionsData || [];
	console.log(questions);

	return (
		<div className="px-22 py-15">
			<button
				onClick={handleBackToForms}
				className="text-sm mb-8 cursor-pointer"
			>
				Back to Forms
			</button>
			<h1 className="text-3xl font-extrabold text-gray-900 mb-1 pb-5">{pageTitle}</h1>
			<div className="bg-white border border-slate-300 rounded-md p-6 max-w-3xl mb-5">
				<div className="font-semibold text-lg leading-7 mb-3">Info</div>
				<div className="font-normal text-sm leading-6 text-slate-800 mb-2">
					<div className="flex gap-1">
						<label>Reply: </label>
						<p>{totalResponses}</p>
					</div>
					<div className="flex gap-1">
						<label>Reply from: </label>
						<p>{uniqueRespondents.join(", ") || "No responses yet"}</p>
					</div>
				</div>
			</div>
			{questions.map((question, index) => {
				// 取得該問題的答案資料
				const answers = questionAnswersQueries[index]?.data || [];
				console.log("answers len: ", answers.length);
				console.log("answers: ", answers);

				return (
					<div
						key={question.id}
						className="bg-white border border-slate-300 rounded-md p-6 max-w-3xl mb-5 h-[302px] flex flex-col"
					>
						<div className="font-semibold text-lg leading-7 mb-4">{question.title}</div>
						<div className="flex-1 overflow-y-auto relative">
							<div className="flex flex-col gap-3 items-start">
								{answers.length > 0 ? (
									answers.map((answer: Answer) => (
										<button
											key={answer.id}
											className="btn btn-primary ml-2 text-sm"
										>
											{answer.value}
										</button>
									))
								) : (
									<p className="text-gray-500 text-sm ml-2">No responses yet</p>
								)}
							</div>
							<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default FormResults;
