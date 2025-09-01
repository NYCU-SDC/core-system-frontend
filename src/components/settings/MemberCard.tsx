import { Avatar, AvatarFallback, Button } from "@/components/ui";

export default function MemberCard() {
	return (
		<div className="min-w-[242px] flex gap-4 items-center">
			<Avatar>
				<AvatarFallback className="bg-slate-200 text-slate-800">EM</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<p className="text-slate-800 text-lg font-semibold">AAA</p>
				<p className="text-slate-800 leadiing-6">aaa</p>
			</div>
			<Button className="bg-slate-200 hover:bg-slate-300" variant="secondary">
				Remove
			</Button>
		</div>
	);
}
