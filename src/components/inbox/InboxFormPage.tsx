import * as React from "react";

type InboxFormPageProps = {
    children: React.ReactNode;
}

export default function InboxFormPage({ children }: InboxFormPageProps) {
    return (
        <div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center">
            <div className="tab-card flex flex-col pt-16 px-8 pb-8 bg-white border-slate-200 w-[800px] h-[986px] gap-6 rounded-[6px]">
                <div className="header w-full flex items-center flex-row gap-4 justify-between">
                    {children}
                </div>
            </div>
        </div>
    )
}
