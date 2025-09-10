type HoverCardProps = {
    title: string;           // 對應 message.title
    subtitle?: string;        // 對應 message.subtitle
    description?: string;     // 先寫死傳進來
};

export default function HoverCard({
                                      title,
                                      subtitle,
                                      description,

                                  }: HoverCardProps) {
    return (
        <div className="hover-card  flex flex-col gap-4 pt-3 pr-2 pb-3 border-b h-[109px]">
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
