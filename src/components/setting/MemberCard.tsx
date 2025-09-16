import { Avatar, AvatarFallback, Button } from "@/components/ui";

type MemberCardProps = {
	avatarUrl: string;
	name: string;
};

export default function MemberCard({ avatarUrl, name }: MemberCardProps) {
	return (
		<div className="flex gap-4 items-center">
			<Avatar>
				<AvatarFallback className="bg-slate-200 text-slate-800">{avatarUrl}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<p className="text-slate-800 text-lg font-semibold">{name}</p>
				{/*<p className="text-slate-800 leadiing-6">{email}</p>*/}
			</div>
			<Button
				className="bg-slate-200 hover:bg-slate-300 text-xs h-6 px-[6px] py-0"
				variant="secondary"
			>
				Remove
			</Button>
		</div>
	);
}
