import { Check } from "lucide-react";

type HoverCardProps = {
	itemId: string;
	contentId: string;
	title: string;
	org: string;
	unit: string;
	previewMessage: string;
	active?: boolean;
	isRead?: boolean;
	isArchived?: boolean;
	onClick?: (itemId: string, contentId: string) => void;
};

export default function HoverCard({ itemId, contentId, title, org, unit, previewMessage, active = false, isRead = false, isArchived = false, onClick }: HoverCardProps) {
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
		<div
			className={`hover-card relative flex flex-col gap-4 pt-3 px-3 pb-3 border-b min-h-[109px] w-full rounded-lg ${active ? "bg-slate-600" : "bg-white"}`}
			onClick={() => onClick?.(itemId, contentId)}
		>
			{/* Unread indicator - LEFT SIDE of hover-card */}
			{!isRead && <div className="absolute left-[-20px] top-[18px] w-[9px] h-[9px] rounded-full bg-slate-400"></div>}

			{/* Archived check mark - LEFT SIDE of hover-card */}
			{isArchived && <Check className="absolute left-[-22px] top-[16px] w-4 h-4 text-green-600" />}

			<div className="hover-card-content flex flex-col gap-1">
				<div className="flex flex-row justify-between items-start hover-card-header">
					<p className={`font-medium text-[17px] ${active ? "text-white" : ""}`}>{title}</p>
					<p className={`text-[13px] whitespace-nowrap ${active ? "text-white" : "text-slate-500"}`}>3 days ago</p>
				</div>
				<p className={`hover-card-subtitle text-[13px] font-medium ${active ? "text-white" : ""}`}>
					{org} {unit}
				</p>
				<p className={`hover-card-description text-[12px] ${active ? "text-white" : ""}`}>{previewMessage}</p>
			</div>
		</div>
	);
}
