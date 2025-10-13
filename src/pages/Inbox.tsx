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
			if (it?.message?.postedBy) set.add(it.message.postedBy);
		}
		return Array.from(set);
	}, [items]);

	const filtered = useMemo(() => {

		const useAll = selectedUnits.includes(ALL) || selectedUnits.length === 0; // ALL scenario
		// TODO: is this check needed?
		if (getInboxListError || getListIsLoading || items.length == 0){
			console.log("in filter process : loading or no items");
			return [];
		}
		console.log("in filter process : success to load items");
		console.log("items is: ",items);
		return items.filter((it) => {
			// unread switch
			console.log("starts to filter, it is: ", it);
			if (unreadOnly && it.isRead) return false;

			const unitId = it.message.postedBy;
			if (useAll) return true;
			return selectedUnits.includes(unitId);
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
				<div  className="tab-card flex flex-col w-[344px]  bg-white border-r border-slate-200 pt-8 pb-8 gap-[10px] box-border h-[986px]" >
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
									onClick={handleCardClick}
								/>
							))
							// units.map(unit => <UnitSelectorContent key={unit.id}>{unit.name}</UnitSelectorContent>)

						)}

						{/*{loading && <p className="text-sm text-slate-500 py-3">Loading…</p>}*/}
						{/*{error && <p className="text-sm text-red-500 py-3">{error}</p>}*/}
						{/*{!loading && !error && items.length === 0 && (*/}
						{/*	<p className="text-sm text-slate-500 py-3">No inbox items</p>*/}
						{/*)}*/}

						{/*{!loading &&*/}
						{/*	!error &&*/}
						{/*	items.map((it) => (*/}
						{/*		<HoverCard*/}
						{/*			key={it.id}*/}
						{/*			title={it.message.title}      // message.title*/}
						{/*			subtitle={it.message.subtitle} // message.subtitle*/}
						{/*			description={STATIC_DESC}*/}
						{/*		/>*/}
						{/*	))}*/}
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
				{/*<InboxFormPage>*/}
				{/*	{getInboxItemError ? (*/}
				{/*		<p className="text-sm text-red-500 py-3">Fail to load.</p>*/}
				{/*	) : getItemIsLoading ? (*/}
				{/*		<p className="text-sm text-slate-500 py-3">Loading Form…</p>*/}
				{/*	) : getItemtIsSuccess && inboxItem?.id && inboxItem?.content ? (*/}
				{/*		<>*/}
				{/*			<div>*/}
				{/*				<p className="post-info text-[14px] text-slate-500 ">{inboxItem.message.subtitle}</p>*/}
				{/*				<p className="deadline text-sm text-slate-500">{formatDeadline(inboxItem.content.deadline)}</p>*/}
				{/*			</div>*/}
				{/*			<h2 className="title text-3xl font-semibold text-slate-900">{inboxItem.content.title}</h2>*/}
				{/*			<p className="description text-sm text-slate-500">{inboxItem.content.description}</p>*/}

				{/*			{*/}
				{/*				inboxItemContent.map((it) => <HoverCard*/}
				{/*					key={it.id}*/}
				{/*					contentId={it.id}*/}
				{/*					title={it.message.title}      // message.title*/}
				{/*					subtitle={it.message.subtitle} // message.subtitle*/}
				{/*					description={STATIC_DESC}*/}
				{/*					onClick={() => handleInboxItemClick(it.id)}*/}
				{/*				/>)*/}
				{/*			}*/}
				{/*		</>*/}
				{/*	) : (*/}
				{/*		<p className="text-sm text-slate-500 py-3">No available Form</p>*/}
				{/*	)}*/}

					{/* form header */}
				{/*	/!*<div>*!/*/}
				{/*	/!*	<p className="post-info text-[14px] text-slate-500 ">Post by NYCU SDC Admin</p>*!/*/}
				{/*	/!*	<div className="unit-info flex flex-1">*!/*/}
				{/*	/!*		<div className="unit-container  rounded-full py-0.5 px-2 gap-[10px] bg-slate-400">*!/*/}
				{/*	/!*			<p className="unit-name text-slate-50 text-[14px]">Unit5</p>*!/*/}
				{/*	/!*		</div>*!/*/}
				{/*	/!*	</div>*!/*/}
				{/*	/!*	<p className="deadline text-sm text-slate-500">2025 年 8 月 15 日（五）23:59 截止</p>*!/*/}
				{/*	/!*</div>*!/*/}
				{/*	/!*<h2 className="title text-3xl font-semibold text-slate-900">請填寫 SDC 志工制服尺寸與飲食需求</h2>*!/*/}
				{/*	/!*<p className="description text-sm text-slate-500">為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。</p>*!/*/}

					 {/*form content */}
				{/*	/!*<div className="form p-4 flex flex-col gap-6">*!/*/}
					{/*	/!* short input *!/*/}
					{/*	<div className="short-input-container w-[350px] flex flex-col gap-1.5">*/}
					{/*		<p className="input-title text-sm font-medium text-slate-900">Short input</p>*/}
					{/*		<Input type="text" placeholder="Pietro Schirano"></Input>*/}
					{/*	</div>*/}

				{/*	/!*	/!* single choice *!/*!/*/}
				{/*		<div className="dropdown-container w-[350px] flex flex-col gap-1.5">*/}
				{/*			<p className="input-title  text-sm font-medium text-slate-900">Selection</p>*/}
				{/*			<Select >*/}
				{/*				<SelectTrigger className="w-full">*/}
				{/*					<SelectValue placeholder="@skirano" />*/}
				{/*				</SelectTrigger>*/}
				{/*				<SelectContent>*/}
				{/*					<SelectItem value="option1">Option1</SelectItem>*/}
				{/*					<SelectItem value="option2">Option2</SelectItem>*/}
				{/*					<SelectItem value="option3">Option3</SelectItem>*/}
				{/*				</SelectContent>*/}
				{/*			</Select>*/}
				{/*		</div>*/}

				{/*	/!*	/!* date *!/*!/*/}
				{/*	/!*	<div className="date-container w-[350px] flex flex-col gap-1.5">*!/*/}
				{/*	/!*		<p className="input-title  text-sm font-medium text-slate-900">Date selection</p>*!/*/}
				{/*	/!*		<Select >*!/*/}
				{/*	/!*			<SelectTrigger className="w-full">*!/*/}
				{/*	/!*				<SelectValue placeholder="@skirano" />*!/*/}
				{/*	/!*			</SelectTrigger>*!/*/}
				{/*	/!*			<SelectContent>*!/*/}
				{/*	/!*				<SelectItem value="option1">Option1</SelectItem>*!/*/}
				{/*	/!*				<SelectItem value="option2">Option2</SelectItem>*!/*/}
				{/*	/!*				<SelectItem value="option3">Option3</SelectItem>*!/*/}
				{/*	/!*			</SelectContent>*!/*/}
				{/*	/!*		</Select>*!/*/}
				{/*	/!*	</div>*!/*/}

				{/*	/!*	/!* multiple choice *!/*!/*/}
				{/*	/!*	<div className="radio-container w-[350px] flex flex-col gap-1.5">*!/*/}
				{/*	/!*		<p className="input-title  text-sm font-medium text-slate-900">Radio</p>*!/*/}
				{/*	/!*		<RadioGroup defaultValue="option-one" className="pt-2 flex flex-col gap-2">*!/*/}
				{/*	/!*			<div className="flex items-center space-x-2">*!/*/}
				{/*	/!*				<RadioGroupItem value="default" id="default" />*!/*/}
				{/*	/!*				<Label htmlFor="default" className="text-sm font-medium">Default</Label>*!/*/}
				{/*	/!*			</div>*!/*/}
				{/*	/!*			<div className="flex items-center space-x-2">*!/*/}
				{/*	/!*				<RadioGroupItem value="comfortable" id="comfortable" />*!/*/}
				{/*	/!*				<Label htmlFor="comfortable" className="text-sm font-medium">Comfortable</Label>*!/*/}
				{/*	/!*			</div>*!/*/}
				{/*	/!*			<div className="flex items-center space-x-2">*!/*/}
				{/*	/!*				<RadioGroupItem value="compact" id="compact" />*!/*/}
				{/*	/!*				<Label htmlFor="compact" className="text-sm font-medium">Compact</Label>*!/*/}
				{/*	/!*			</div>*!/*/}
				{/*	/!*		</RadioGroup>*!/*/}
				{/*	/!*	</div>*!/*/}

				{/*	/!*	/!* long input *!/*!/*/}
				{/*		<div className="long-input-container w-[350px] flex flex-col gap-1.5">*/}
				{/*			<p className="input-title text-sm font-medium text-slate-900 border-slate-300">Long input</p>*/}
				{/*			<Textarea />*/}
				{/*		</div>*/}

				{/*	/!*	/!* submit button *!/*!/*/}
				{/*	/!*	<div className="button-container inline-flex py-2 px-4 gap-[10px] bg-slate-900 rounded-md w-fit ">*!/*/}
				{/*	/!*		<button className="text-sm text-white">Submit</button>*!/*/}
				{/*	/!*	</div>*!/*/}

				{/*	/!*</div>*!/*/}
				{/*</InboxFormPage>*/}
			</div>
		</>
	);
};

export default Inbox;
