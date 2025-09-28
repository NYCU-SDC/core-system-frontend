//import {useGetInboxItemContent} from "@/hooks/useGetInboxItemContent.ts";

type HoverCardProps = {

    contentId: string;       // 對應 message.id
    title: string;           // 對應 message.title
    subtitle?: string;        // 對應 message.subtitle
    description?: string;     // 先寫死傳進來
    //onClick?: () => void;
    onClick?: (contentId: string) => void;
};

export default function HoverCard({

                                      contentId,
                                      title,
                                      subtitle,
                                      description,
                                      onClick
                                  }: HoverCardProps) {
    // const handleInboxItenClick (id: string) {
    //     useGetInboxItemContent(id);
    //     {getInboxListError ? (
    //         <p className="text-sm text-red-500 py-3">Fail to load.</p>
    //     ) : !inboxList ? (
    //         <p className="text-sm text-slate-500 py-3">Loading Inbox…</p>
    //     ) : units.length === 0 ? (
    //         <p className="text-sm text-slate-500 py-3">No inbox items</p>
    //     ) : (
    //         items.map((it) => (
    //             <HoverCard
    //                 contentId={it.id}
    //                 title={it.message.title}      // message.title
    //                 subtitle={it.message.subtitle} // message.subtitle
    //                 description={STATIC_DESC}
    //             />
    //         ))
    //         // units.map(unit => <UnitSelectorContent key={unit.id}>{unit.name}</UnitSelectorContent>)
    //
    //     )}
    // }

    return (
        // <div className="hover-card  flex flex-col gap-4 pt-3 pr-2 pb-3 border-b h-[109px]" onClick={handleInboxItenClick(contentId)}>
        <div className="hover-card  flex flex-col gap-4 pt-3 pr-2 pb-3 border-b h-[109px]" onClick={onClick}>
            <div className="hover-card-content  flex flex-col gap-1 bg-white ">
                <div className="flex flex-row justify-between hover-card-header">
                    <p className="font-medium text-[17px]">{title}</p>
                    <p className="text-[13px] text-slate-500">3天前</p>
                </div>
                <p className="hover-card-subtitle text-[13px] font-medium">{subtitle}</p>
                <p className="hover-card-description text-[12px]">{description ?? "各位工人好，以下是活動當天的住宿、接駁、報到與用餐等相關資訊，活動日期..."}</p>
            </div>
        </div>
    );
}
