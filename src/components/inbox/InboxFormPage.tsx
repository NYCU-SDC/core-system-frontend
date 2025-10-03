import * as React from "react";
import type { InboxItemResponse, InboxItemContentResponse } from "@/types/inbox";
import QuestionRenderer from "@/components/inbox/QuestionRenderer";
type InboxFormPageProps = {
    // 狀態
    hasSelected: boolean;
    isLoadingItem: boolean;
    isLoadingContent: boolean;
    isErrorItem: boolean;
    isErrorContent: boolean;
    // 資料
    inboxItem?: InboxItemResponse;
    inboxItemContent?: InboxItemContentResponse[];
    // 工具函數
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

    if (!hasSelected) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-slate-500">請選擇一個項目</p>
            </div>
        );
    }
    // 載入中（任一資料載入中）
    if (isLoadingItem || isLoadingContent) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-sm text-slate-500 py-3">Loading Form…</p>
            </div>
        );
    }

    // 載入失敗（任一資料載入失敗）
    if (isErrorItem || isErrorContent) {
        return (
            <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center items-center">
                <p className="text-sm text-red-500 py-3">Fail to load.</p>
            </div>
        );
    }

    // 檢查資料完整性
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
                    <div>
                        <p className="post-info text-[14px] text-slate-500 ">{inboxItem.message.subtitle}</p>
                        <p className="deadline text-sm text-slate-500">{formatDeadline(inboxItem.content.deadline)}</p>
                    </div>
                    <h2 className="title text-3xl font-semibold text-slate-900">{inboxItem.content.title}</h2>
                    <p className="description text-sm text-slate-500">{inboxItem.content.description}</p>
                    {/* Form fields - 動態渲染 */}
                    <div className="form p-4 flex flex-col gap-6">
                        {questions.map((q) => (
                            <QuestionRenderer
                                key={q.id}
                                q={q}
                                //value={formValues[field.id]}
                                //onChange={(value) => handleFieldChange(q.id, value)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
