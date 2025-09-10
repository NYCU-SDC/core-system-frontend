import React, { useEffect, useState } from "react";
import type { FormData } from "@/types/form.ts";
import { useNavigate, useParams } from "react-router-dom";
import type { Question } from "@/types/question.ts";
import "@/components/form/DraftFormCard.css"

interface PublishedFormData extends FormData {
	replyNumber?: string;
	replyFrom?: string[];
}

const fetchFormById = async (id: string): Promise<PublishedFormData | null> => {
	await new Promise(resolve => setTimeout(resolve, 300));

	return {
		id: id,
		title: '請填寫 SDC 志工制服尺寸與飲食需求',
		unit: ['Administration'],
		description: '為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。',
		time: '2025-04-23 16:00',
		status: 'published',
		replyNumber: '20',
		replyFrom: ['EM', '小知', '海鷗', 'Ethel', 'Nikka']
	};
}

const FormResults: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<PublishedFormData | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadForm = async () => {
			try {
				setLoading(true);
				const data = await fetchFormById(id!);
				setFormData(data);
			} catch (error) {
				console.error('Failed to load form:', error);
			} finally {
				setLoading(false);
			}
		};
		loadForm();
	}, [id]);

	const handleBackToForms = () => {
		navigate('/forms');
	};

	if (loading) {
		return (
			<div className="p-10">
				<div className="flex justify-center items-center h-64">
					<p className="text-gray-600">Loading form...</p>
				</div>
			</div>
		);
	}

	const pageTitle = `Result - ${formData?.title || 'Loading...'}`;

	return (
		<div className="px-22 py-15">
			<button
				onClick={handleBackToForms}
				className="text-sm mb-8 cursor-pointer">
				Back to Forms
			</button>
			<h1 className="text-3xl font-extrabold text-gray-900 mb-1 pb-5">{pageTitle}</h1>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="font-semibold text-lg leading-7 mb-3">Info</div>
				<div className="font-normal text-sm leading-6 text-slate-800 mb-2">
					<div className="flex gap-1">
						<label>Reply: </label>
						<p>{formData?.replyNumber}</p>
					</div>
					<div className="flex gap-1">
						<label>Reply: </label>
						<p>{formData?.replyFrom?.join(', ')}</p>
					</div>
				</div>
			</div>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5 h-[302px] flex flex-col">
				<div className="font-semibold text-lg leading-7 mb-4">Short / Long Text</div>
				<div className="flex-1 overflow-y-auto relative">
					<div className="flex flex-col gap-3 items-start">
						<button className="btn btn-primary ml-2 text-sm">Elvis Dragon Mao</button>
						<button className="btn btn-primary ml-2 text-sm">小知</button>
						<button className="btn btn-primary ml-2 text-sm">海鷗</button>
						<button className="btn btn-primary ml-2 text-sm">Ethel Hsiao</button>
						<button className="btn btn-primary ml-2 text-sm">Nikka Lin</button>
						<button className="btn btn-primary ml-2 text-sm">Elvis Dragon Mao</button>
						<button className="btn btn-primary ml-2 text-sm">小知</button>
						<button className="btn btn-primary ml-2 text-sm">海鷗</button>
						<button className="btn btn-primary ml-2 text-sm">Ethel Hsiao</button>
						<button className="btn btn-primary ml-2 text-sm">Nikka Lin</button>
					</div>
					<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
				</div>
			</div>
			<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
				<div className="font-semibold text-lg leading-7 mb-3">Single Choice / Multiple Choice / Date</div>
			</div>
		</div>
	)
}

export default FormResults;