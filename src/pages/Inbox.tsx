import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import HoverCard from "@/components/inbox/HoverCard.tsx";
import MenuBar from "@/components/inbox/MenuBar.tsx";
import UnreadSwitch from "@/components/inbox/UnreadSwitch.tsx";
import SearchInput	 from "@/components/inbox/SearchInput.tsx";
import HoverCardContainer from "@/components/inbox/HoverCardContainer.tsx";
import InboxFormPage from "@/components/inbox/InboxFormPage.tsx";

import { useEffect, useMemo, useState } from "react";
import { useGetInboxList } from "@/hooks/useGetInboxList.ts";
import { useUpdateInbox} from "@/hooks/useUpdateInbox.ts";
import {useGetInboxItem} from "@/hooks/useGetInboxItem.ts";
import useGetInboxItemContent from "@/hooks/useGetInboxItemContent";

import {UnitSelectorContent} from "@/components/setting/UnitSelector.tsx";
import {useParams} from "react-router-dom";



const ALL = "All";
const STATIC_DESC =
	"Hello everyone, here are the accommodation, transportation, check-in and dining information...";


const Inbox = () => {
	//return null;
	const { slug: organizationSlug } = useParams();
	const [selectedId, setSelectedId] = useState<{itemId: string; contentId: string} | null>(null);
	const {data: inboxList, isLoading: getListIsLoading,isError: getInboxListError} = useGetInboxList();
	const updateInbox = useUpdateInbox();
	const {data: inboxItemContent, isSuccess: getContentIsSuccess, isLoading: getContentIsLoading,isError: getInboxItemContentError} = useGetInboxItemContent(selectedId?.contentId ?? null);
	const {data: inboxItem, isSuccess: getItemtIsSuccess, isLoading: getItemIsLoading, isError: getInboxItemError} = useGetInboxItem(selectedId?.itemId ?? null);
	//
    // const [items, setItems] = useState<InboxItem[]>([]);
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);
	//
	const [selectedUnits, setSelectedUnits] = useState<string[]>([ALL]);
	const [unreadOnly, setUnreadOnly] = useState<boolean>(false);



	const items = inboxList?.items || []; // items of inboxList named to be items
	const units = useMemo(() => {

		const set = new Set<string>();
		for (const it of items) {
			if (it?.message?.unit) set.add(it.message.unit);
		}
		return Array.from(set);
	}, [items]);

	const filtered = useMemo(() => {

		const useAll = selectedUnits.includes(ALL) || selectedUnits.length === 0; // ALL scenario
		if (getInboxListError || getListIsLoading || items.length == 0){
			return [];
		}
		return items.filter((it) => {
			// unread switch
			if (unreadOnly && it.isRead) return false;

			const unitName = it.message.unit;
			if (useAll) return true;
			return selectedUnits.includes(unitName);
		});
	}, [items, selectedUnits, unreadOnly]);
	const handleCardClick = (itemId: string, contentId: string) => {
		setSelectedId({ itemId, contentId });

		// Find the current item to preserve its flags
		const currentItem = items.find(item => item.id === itemId);
		if (currentItem) {
			updateInbox.mutate({
				id: itemId,
				flags: {
					isRead: true,
					isStarred: currentItem.isStarred,
					isArchived: currentItem.isArchived
				}
			});
		}
	};

	function formatDeadline(isoString: string): string {
		const date = new Date(isoString);

		const formatter = new Intl.DateTimeFormat('zh-TW', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			weekday: 'short',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			timeZone: 'Asia/Taipei'
		});

		const parts = formatter.formatToParts(date);
		const year = parts.find(p => p.type === 'year')?.value;
		const month = parts.find(p => p.type === 'month')?.value;
		const day = parts.find(p => p.type === 'day')?.value;
		const weekday = parts.find(p => p.type === 'weekday')?.value;
		const hour = parts.find(p => p.type === 'hour')?.value;
		const minute = parts.find(p => p.type === 'minute')?.value;

		return `${year} 年 ${month} 月 ${day} 日（${weekday}）${hour}:${minute} 截止`;
	}



    return (
		<>
			<div className="flex flex-row">
				<div  className="tab-card flex flex-col w-[344px] min-w-[344px] max-w-[344px] bg-white border-r border-slate-200 pt-8 pb-8 gap-[10px] box-border h-[986px] rounded-l-lg" >
					<div className="tab-card-container w-full h-fit flex flex-col gap-[10px] px-4 pb-4 border-b ">
						<div className="tab-card-header flex flex-row justify-between items-center w-full h-fit ">
							<h2 className="font-semibold text-[30px] text-slate-800 ">Inbox</h2>
							<UnreadSwitch
								checked={unreadOnly}
								onCheckedChange={setUnreadOnly}
							/>
						</div>
						<SearchInput />
						<MenuBar
							units={units}
							selected={selectedUnits}
							onChange={setSelectedUnits}
						/>
					</div>
					<HoverCardContainer>
						{getInboxListError ? (
							<p className="text-sm text-red-500 py-3">Fail to load.</p>
						) : !inboxList ? (
							<p className="text-sm text-slate-500 py-3">Loading Inbox…</p>
						) : filtered.length === 0 ? (
							<p className="text-sm text-slate-500 py-3">No inbox items</p>
						) : (
							filtered.map((it) => (
								<HoverCard
									key={it.message.id}
									itemId={it.id}
									contentId={it.message.contentId}
									title={it.message.title}
									org={it.message.org}
									unit={it.message.unit}
									previewMessage={it.message.previewMessage}
									active={selectedId?.itemId === it.id}
									isRead={it.isRead}
									isArchived={it.isArchived}
									onClick={handleCardClick}
								/>
							))
							// units.map(unit => <UnitSelectorContent key={unit.id}>{unit.name}</UnitSelectorContent>)

						)}

					</HoverCardContainer>

				</div>
				<InboxFormPage
					hasSelected={!!selectedId}
					isLoadingItem={getItemIsLoading}
					isLoadingContent={getContentIsLoading}
					isErrorItem={getInboxItemError}
					isErrorContent={getInboxItemContentError}
					inboxItem={inboxItem}
					inboxItemContent={inboxItemContent}
					formatDeadline={formatDeadline}
				/>
			</div>
		</>
	);
};

export default Inbox;
