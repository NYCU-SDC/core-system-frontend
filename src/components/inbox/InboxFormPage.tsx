import * as React from "react";
import type { InboxItemResponse, InboxItemContentResponse } from "@/types/inbox";
import QuestionRenderer from "@/components/inbox/QuestionRenderer";
import { useSubmitFormResponse } from "@/hooks/useSubmitFormResponse";
type InboxFormPageProps = {

    hasSelected: boolean;
    isLoadingItem: boolean;
    isLoadingContent: boolean;
    isErrorItem: boolean;
    isErrorContent: boolean;

    inboxItem?: InboxItemResponse;
    inboxItemContent?: InboxItemContentResponse[];

    formatDeadline: (isoString: string) => string;
};

export default function InboxFormPage({
  hasSelected,
  isLoadingItem,
  isLoadingContent,
  isErrorItem,
  isErrorContent,
  inboxItem,
  inboxItemContent,
  formatDeadline
}: InboxFormPageProps) {
    // State to store form answers
    const [formAnswers, setFormAnswers] = React.useState<Record<string, string | string[]>>({});

    const { mutate: submitForm, isPending } = useSubmitFormResponse();

    const handleAnswerChange = (questionId: string, value: string | string[]) => {
        setFormAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = () => {
        if (!inboxItem?.content?.id) {
            console.error("No form ID available");
            return;
        }

        const answersArray = Object.entries(formAnswers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? value.join(',') : value
        }));

        submitForm({ formId: inboxItem.content.id, answers: { answers: answersArray } });
    };

    if (!hasSelected) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-slate-500">Please select an item</p>
            </div>
        );
    }

    if (isLoadingItem || isLoadingContent) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-sm text-slate-500 py-3">Loading Form…</p>
            </div>
        );
    }


    if (isErrorItem || isErrorContent) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-sm text-red-500 py-3">Fail to load.</p>
            </div>
        );
    }

    if (!inboxItem?.id || !inboxItem?.content || !inboxItemContent || inboxItemContent.length === 0) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-sm text-slate-500 py-3">No available Form</p>
            </div>
        );
    }

    const questions = inboxItemContent.sort((a, b) => a.order - b.order);

    return (
        <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center">
            <div className="tab-card flex flex-col pt-16 px-8 pb-8 bg-white border-slate-200 w-[800px] h-[986px] gap-6 rounded-[6px]">
                <div className="header w-full flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <p className="post-info text-[14px] text-slate-500">Post by {inboxItem.message.org} {inboxItem.message.unit}</p>
                        <p className="deadline text-sm text-slate-500">{formatDeadline(inboxItem.content.deadline)}</p>
                    </div>
                    <h2 className="title text-3xl font-semibold text-slate-900">{inboxItem.content.title}</h2>
                    <p className="description text-sm text-slate-500">{inboxItem.content.description}</p>
                    {/* Form fields */}
                    <div className="form p-4 flex flex-col gap-6">
                        {questions.map((q) => (
                            <QuestionRenderer
                                key={q.id}
                                q={q}
                                value={formAnswers[q.id] || (q.type === 'multiple_choice' ? [] : '')}
                                onChange={(value) => handleAnswerChange(q.id, value)}
                            />
                        ))}
                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="button-container inline-flex py-2 px-4 gap-[10px] bg-slate-900 rounded-md w-fit text-sm text-white"
                        >
                            {isPending ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
