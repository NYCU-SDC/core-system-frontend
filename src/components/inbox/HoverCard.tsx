//import {useGetInboxItemContent} from "@/hooks/useGetInboxItemContent.ts";

type HoverCardProps = {
    itemId: string;
    contentId: string;
    title: string;
    org: string;
    unit: string;
    previewMessage: string;
    active?: boolean;
    onClick?: (itemId: string, contentId: string) => void;
};

export default function HoverCard({

                                      itemId,
                                      contentId,
                                      title,
                                      org,
                                      unit,
                                      previewMessage,
                                      active = false,
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
        <div className={`hover-card flex flex-col gap-4 pt-3 px-3 pb-3 border-b h-[109px] rounded-lg ${active ? 'bg-slate-500 text-slate-100' : 'bg-white'}`} onClick={() => onClick?.(itemId, contentId)}>
            <div className="hover-card-content flex flex-col gap-1">
                <div className="flex flex-row justify-between hover-card-header">
                    <p className="font-medium text-[17px]">{title}</p>
                    <p className={`text-[13px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>3 days ago</p>
                </div>
                <p className={`hover-card-subtitle text-[13px] font-medium ${active ? 'text-slate-200' : ''}`}>{org} {unit}</p>
                <p className={`hover-card-description text-[12px] ${active ? 'text-slate-300' : ''}`}>{previewMessage}</p>
            </div>
        </div>
    );
}
