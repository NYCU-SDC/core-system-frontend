import * as React from "react";
import type { InboxItemResponse, InboxItemContentResponse } from "@/types/inbox";
import QuestionRenderer from "@/components/inbox/QuestionRenderer";
import { useSubmitFormResponse } from "@/hooks/useSubmitFormResponse";
import { useUpdateInbox } from "@/hooks/useUpdateInbox";
import { Inbox } from "lucide-react";

type InboxFormPageProps = {
	hasSelected: boolean;
	isErrorItem: boolean;
	isErrorContent: boolean;
	isLoadingItem: boolean;
	isLoadingContent: boolean;

	inboxItem?: InboxItemResponse;
	inboxItemContent?: InboxItemContentResponse[];

	formatDeadline: (isoString: string) => string;
};

export default function InboxFormPage({ hasSelected, isErrorItem, isErrorContent, isLoadingItem, isLoadingContent, inboxItem, inboxItemContent, formatDeadline }: InboxFormPageProps) {
	// State to store form answers
	const [formAnswers, setFormAnswers] = React.useState<Record<string, string | string[]>>({});
	const [isSubmitted, setIsSubmitted] = React.useState(false);

	const { mutate: submitForm, isPending } = useSubmitFormResponse();
	const updateInbox = useUpdateInbox();

	React.useEffect(() => {
		setFormAnswers({});
		setIsSubmitted(false);
	}, [inboxItem?.id]);

	const handleAnswerChange = (questionId: string, value: string | string[]) => {
		setFormAnswers(prev => ({
			...prev,
			[questionId]: value
		}));
	};

	const handleSubmit = () => {
		if (!inboxItem?.content?.id || !inboxItem?.id) {
			console.error("No form ID or inbox item ID available");
			return;
		}

		const answersArray = Object.entries(formAnswers).map(([questionId, value]) => ({
			questionId,
			value: Array.isArray(value) ? value.join(";") : value
		}));

		submitForm(
			{ formId: inboxItem.content.id, answers: { answers: answersArray } },
			{
				onSuccess: () => {
					// Archive the inbox item after successful form submission
					updateInbox.mutate({
						id: inboxItem.id,
						flags: {
							isRead: inboxItem.isRead,
							isStarred: inboxItem.isStarred,
							isArchived: true
						}
					});
					// Mark as submitted
					setIsSubmitted(true);
				}
			}
		);
	};

	// Show "select an item" only if nothing is selected
	if (!hasSelected) {
		//DEBUG
		console.log("No item selected, showing placeholder.");

		return (
			<div className="detail-container flex flex-col p-4 md:p-8 lg:p-16 gap-4 flex-1 h-dvh justify-center items-center overflow-y-auto">
				<Inbox
					className="w-[40px] h-[32px] text-gray-400"
					strokeWidth={4}
				/>
				<p className="text-gray-400 font-medium text-[14px] leading-5">Please select an item to view details.</p>
			</div>
		);
	}

	// Show error if there was a problem loading
	if (isErrorItem || isErrorContent) {
		// DEBUG
		if(isErrorItem) {
			console.error("Error loading inbox item.");
		}
		if(isErrorContent) {
			console.error("Error loading inbox item content.");
		}

		return (
			<div className="detail-container flex p-4 md:p-8 lg:p-16 gap-4 flex-1 h-dvh justify-center items-center overflow-y-auto">
				<p className="text-sm text-red-500 py-3">Fail to load.</p>
			</div>
		);
	}

	// Show loading skeleton when data is being fetched OR when we're waiting for data
	// (hasSelected but no data yet means we should show loading)
	if (isLoadingItem || isLoadingContent || !inboxItem || !inboxItemContent) {

		//DEBYUG
		if(isLoadingItem) {
			console.log("Loading inbox item...");
		}
		if(isLoadingContent) {
			console.log("Loading inbox item content...");
		}
		if(!inboxItem) {
			console.log("No inbox item yet...");
		}
		if(!inboxItemContent) {
			console.log("No inbox item content data yet...");
		}
		return (
			<div className="detail-container flex p-4 md:p-8 lg:p-16 gap-4 flex-1 h-dvh justify-center overflow-y-auto">
				<div className="tab-card flex flex-col pt-8 md:pt-12 lg:pt-16 px-4 md:px-6 lg:px-8 pb-8 bg-white border-slate-200 w-full max-w-[800px] h-dvh gap-6 rounded-[6px] animate-pulse">
					<div className="header w-full flex flex-col gap-4">
						<div className="flex justify-between items-center">
							<div className="h-5 bg-slate-200 rounded w-48"></div>
							<div className="h-5 bg-slate-200 rounded w-64"></div>
						</div>
						<div className="h-9 bg-slate-200 rounded w-3/4"></div>
						<div className="h-4 bg-slate-200 rounded w-full"></div>
						<div className="h-4 bg-slate-200 rounded w-5/6"></div>
						<div className="form p-4 flex flex-col gap-6 mt-4">
							<div className="h-20 bg-slate-200 rounded"></div>
							<div className="h-20 bg-slate-200 rounded"></div>
							<div className="h-20 bg-slate-200 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const questions = inboxItemContent ? inboxItemContent.sort((a, b) => a.order - b.order) : [];

	return (
		<div className="detail-container flex p-4 md:p-8 lg:p-16 gap-4 flex-1 h-dvh justify-center overflow-y-auto">
			<div className="tab-card flex flex-col pt-8 md:pt-12 lg:pt-16 px-4 md:px-6 lg:px-8 pb-8 bg-white border-slate-200 w-full max-w-[800px] h-fit min-h-dvh gap-6 rounded-[6px]">
				<div className="header w-full flex flex-col gap-4">
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
						<p className="post-info text-[14px] text-slate-500">
							Post by {inboxItem.message.org} {inboxItem.message.unit}
						</p>
						<p className="deadline text-sm text-slate-500">{formatDeadline(inboxItem.content.deadline)}</p>
					</div>
					<h2 className="title text-2xl md:text-3xl font-semibold text-slate-900 break-words">{inboxItem.content.title}</h2>
					<p className="description text-sm text-slate-500 break-words">{inboxItem.content.description}</p>
					{/* Form fields */}
					<div className="form p-4 flex flex-col gap-6">
						{questions.map(q => (
							<QuestionRenderer
								key={q.id}
								q={q}
								value={formAnswers[q.id] || (q.type === "multiple_choice" ? [] : "")}
								onChange={value => handleAnswerChange(q.id, value)}
							/>
						))}
						{/* Submit Button - only show if there are questions */}
						{questions.length > 0 && (
							<button
								onClick={handleSubmit}
								disabled={isPending || isSubmitted}
								className="button-container inline-flex py-2 px-4 gap-[10px] bg-slate-900 rounded-md w-fit text-sm text-white disabled:opacity-50"
							>
								{isSubmitted ? "Sent" : isPending ? "Sending" : "Send"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
