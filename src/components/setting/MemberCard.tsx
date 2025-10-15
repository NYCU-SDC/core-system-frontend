import { Avatar, AvatarImage, Button } from "@/components/ui";

type MemberCardProps = {
	avatarUrl: string;
	name: string;
	id: string;
	onClick: (memberId: string) => void;
};

export default function MemberCard({ avatarUrl, name, id, onClick }: MemberCardProps) {
	return (
		<div className="flex gap-4 items-center">
			<Avatar>
				<AvatarImage
					className="bg-slate-200 text-slate-800"
					src={avatarUrl}
				></AvatarImage>
			</Avatar>
			<div className="flex-1">
				<p className="text-slate-800 text-lg font-semibold">{name}</p>
				{/*<p className="text-slate-800 leadiing-6">{email}</p>*/}
			</div>
			<Button
				className="bg-slate-200 hover:bg-slate-300 text-xs h-6 px-[6px] py-0"
				variant="secondary"
				onClick={() => onClick(id)}
			>
				Remove
			</Button>
		</div>
	);
}
