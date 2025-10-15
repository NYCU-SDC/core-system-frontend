import type { FormData } from "@/types/form.ts";

interface FormInfoProps {
	formData: FormData | null;
	isNewForm: boolean;
	formatDate: (dateString: string) => string;
	onDelete: () => void;
	onPublish: () => void;
	isDeleting: boolean;
	isPublishing: boolean;
}

export const FormInfo = ({ formData, isNewForm, formatDate, onDelete, onPublish, isDeleting, isPublishing }: FormInfoProps) => {
	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 max-w-3xl mb-5">
			<div className="font-semibold text-lg leading-7 mb-3">Info</div>
			<div className="font-normal text-sm leading-6 text-slate-800 mb-4">
				<div>Status: {formData?.status === "draft" ? "Draft" : "Published"}</div>
				<div className="flex gap-1">
					<label>Created At: </label>
					<p>{isNewForm ? "Not created yet" : formatDate(formData?.createdAt || "")}</p>
				</div>
				<div className="flex gap-1">
					<label>Updated At: </label>
					<p>{isNewForm ? "Not created yet" : formatDate(formData?.updatedAt || "")}</p>
				</div>
				<div className="flex gap-1">
					<label>Last Editor: </label>
					<p>{isNewForm ? "You" : formData?.lastEditor || "unknown"}</p>
				</div>
			</div>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onDelete}
					disabled={isDeleting}
					className="px-4 py-2 rounded-md bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isDeleting ? "Deleting..." : "Delete"}
				</button>
				<button
					type="button"
					onClick={onPublish}
					disabled={isPublishing}
					className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isPublishing ? "Publishing..." : "Publish"}
				</button>
			</div>
		</div>
	);
};
