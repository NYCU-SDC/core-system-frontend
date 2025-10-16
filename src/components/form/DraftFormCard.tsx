import React from "react";
import type { FormCardProps } from "@/types/forms.ts";
import { useNavigate } from "react-router-dom";

const DraftFormCard: React.FC<FormCardProps> = ({ form, slug }) => {
	const navigate = useNavigate();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("zh-TW", {
			year: "numeric",
			month: "numeric",
			day: "numeric"
		});
	};

	const handleEdit = (id: string) => {
		console.log("Edit:", id);
		navigate(`/${slug}/forms/edit/${id}`);
	};

	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 mt-1.5 min-h-[180px] max-w-full w-[400px]">
			<div className="flex flex-wrap gap-2.5 mb-3 items-center">
				<div className="font-inter font-semibold text-lg leading-7">{form.title}</div>
				<div className="bg-slate-400 text-slate-50 text-xs font-semibold px-2 rounded-lg gap-2.5 flex items-center break-words">{form.unitId}</div>
			</div>
			<div>
				<div className="font-inter font-normal text-sm leading-5 text-slate-500 h-[3em]">{form.description}</div>
			</div>
			<div className="flex items-end mt-1.5 flex-wrap">
				<div className="font-inter font-normal text-sm leading-5 text-slate-500">
					<label>Created at </label>
					<span>{formatDate(form.createdAt)}</span>
				</div>
				<div className="ml-auto flex gap-2 justify-end">
					<button
						className="h-10 rounded-md cursor-pointer transition-all duration-200 px-4 py-2 gap-2.5 text-sm border border-slate-200 hover:-translate-y-px"
						onClick={() => handleEdit(form.id)}
					>
						Edit
					</button>
				</div>
			</div>
		</div>
	);
};

export default DraftFormCard;
