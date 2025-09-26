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

import { useEffect, useMemo, useState } from "react";
import { useGetInboxList } from "@/hooks/useGetInboxList.ts";
import {UnitSelectorContent} from "@/components/setting/UnitSelector.tsx";



const ALL = "All";
const STATIC_DESC =
	"各位工人好，以下是活動當天的住宿、接駁、報到與用餐等相關資訊，活動日期...";


const Inbox = () => {

	const {data: inboxList, isError: getInboxListError} = useGetInboxList();
	//test
	if(getInboxListError){
		console.log("get error");
	}
	else console.log("no error");
	//
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


	// 篩選狀態
	const [selectedUnits, setSelectedUnits] = useState<string[]>([ALL]); // 初始 All
	const [unreadOnly, setUnreadOnly] = useState(false);

	// useEffect(() => {
	// 	let cancelled = false;
	//
	// 	(async () => {
	// 		try {
	// 			setLoading(true);
	// 			setError(null);
	// 			const data = await fetchInbox();
	// 			if (!cancelled) setItems(data.items);
	// 		} catch (e: any) {
	// 			if (!cancelled) setError(e?.message ?? "Failed to load inbox");
	// 		} finally {
	// 			if (!cancelled) setLoading(false);
	// 		}
	// 	})();
	//
	// 	return () => {
	// 		cancelled = true;
	// 	};
	// }, []);


	const units = useMemo(() => {
		const set = new Set<string>();
		for (const it of items) {
			if (it?.message?.postedBy) set.add(it.message.postedBy);
		}
		return Array.from(set);
	}, [items]);

	const filtered = useMemo(() => {
		const useAll = selectedUnits.includes(ALL) || selectedUnits.length === 0;

		return items.filter((it) => {
			// unread switch
			if (unreadOnly && it.type.isRead) return false;

			const unitId = it.message.postedBy;
			if (useAll) return true;
			return selectedUnits.includes(unitId);
		});
	}, [items, selectedUnits, unreadOnly]);

    return (
		<>
			<div className="flex flex-row">
				<div  className="tab-card flex flex-col w-[344px]  bg-white border-r border-slate-200 pt-8 pb-8 gap-[10px] box-border h-[986px]" >
					<div className="tab-card-container w-full h-fit flex flex-col gap-[10px] px-4 pb-4 border-b ">
						<div className="tab-card-header flex flex-row justify-between items-center w-full h-fit ">
							<h2 className="font-semibold text-[30px] text-slate-800 ">Inbox</h2>
							{/*<UnreadSwitch />*/}
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
						) : units.length === 0 ? (
							<p className="text-sm text-slate-500 py-3">No inbox items</p>
						) : (
							items.map((it) => (
								<HoverCard
									contentId={it.id}
									title={it.message.title}      // message.title
									subtitle={it.message.subtitle} // message.subtitle
									description={STATIC_DESC}
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
				<div className="detail-container flex p-16 gap-4 flex-1 h-[982px] justify-center">
					<div className="tab-card flex flex-col pt-16 px-8 pb-8 bg-white border-slate-200 w-[800px] h-[986px] gap-6 rounded-[6px]">
						<div className="header w-full flex  items-center flex-row gap-4 justify-between">
							<p className="post-info text-[14px] text-slate-500 ">Post by NYCU SDC 行政組</p>
							<div className="unit-info flex flex-1">
								<div className="unit-container  rounded-full py-0.5 px-2 gap-[10px] bg-slate-400">
									<p className="unit-name text-slate-50 text-[14px]">Unit5</p>
								</div>
							</div>
							<p className="deadline text-sm text-slate-500">2025 年 8 月 15 日（五）23:59 截止</p>
						</div>
						<h2 className="title text-3xl font-semibold text-slate-900">請填寫 SDC 志工制服尺寸與飲食需求</h2>
						<p className="description text-sm text-slate-500">為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。</p>
						<div className="form p-4 flex flex-col gap-6">
							<div className="short-input-container w-[350px] flex flex-col gap-1.5">
								<p className="input-title text-sm font-medium text-slate-900">短輸入</p>
								<Input type="text" placeholder="Pietro Schirano"></Input>
							</div>
							<div className="dropdown-container w-[350px] flex flex-col gap-1.5">
								<p className="input-title  text-sm font-medium text-slate-900">選擇</p>
								<Select >
									<SelectTrigger className="w-full">
										<SelectValue placeholder="@skirano" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="option1">Option1</SelectItem>
										<SelectItem value="option2">Option2</SelectItem>
										<SelectItem value="option3">Option3</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="date-container w-[350px] flex flex-col gap-1.5">
								<p className="input-title  text-sm font-medium text-slate-900">日期選擇</p>
								<Select >
									<SelectTrigger className="w-full">
										<SelectValue placeholder="@skirano" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="option1">Option1</SelectItem>
										<SelectItem value="option2">Option2</SelectItem>
										<SelectItem value="option3">Option3</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="radio-container w-[350px] flex flex-col gap-1.5">
								<p className="input-title  text-sm font-medium text-slate-900">Radio</p>
								<RadioGroup defaultValue="option-one" className="pt-2 flex flex-col gap-2">
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="default" id="default" />
										<Label htmlFor="default" className="text-sm font-medium">Default</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="comfortable" id="comfortable" />
										<Label htmlFor="comfortable" className="text-sm font-medium">Comfortable</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="compact" id="compact" />
										<Label htmlFor="compact" className="text-sm font-medium">Compact</Label>
									</div>
								</RadioGroup>
							</div>
							<div className="long-input-container w-[350px] flex flex-col gap-1.5">
								<p className="input-title text-sm font-medium text-slate-900 border-slate-300">長輸入</p>
								<Textarea />
							</div>
							<div className="button-container inline-flex py-2 px-4 gap-[10px] bg-slate-900 rounded-md w-fit ">
								<button className="text-sm text-white">送出</button>
							</div>

						</div>
					</div>



				</div>

			</div>
		</>



	);
};

export default Inbox;
