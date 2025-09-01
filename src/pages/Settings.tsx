import MemberCard from "@/components/settings/MemberCard.tsx";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input.tsx";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar.tsx";

const Settings = () => {
	return (
		<div className="flex flex-col pl-32 pt-24 pr-8 pb-4 gap-8">
			<p className="text-slate-800 text-5xl font-bold">Settings</p>

			<p className="text-slate-800 text-3xl font-semibold">About</p>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Name</p>
				<div className="w-[350px] flex flex-col gap-6">
					<div>
						<p>Team Name</p>
						<Input className="mt-[6px]" />
					</div>
					<div>
						<p>Slug</p>
						<Input className="mt-[6px]" />
					</div>
					<Button className="w-fit">Save</Button>
				</div>
			</div>

			<p className="text-slate-800 text-3xl font-semibold">Team</p>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Invite</p>
				<div className="w-[350px] flex flex-col gap-6">
					<div>
						<p>Email</p>
						<Input className="mt-[6px]" />
					</div>
					<div className="w-wrap">
						<p>Unit</p>
						<Menubar className="h-fit w-fit flex flex-wrap">
							<MenubarMenu>
								<MenubarTrigger className="px-[12px] py-[6px]">AAA</MenubarTrigger>
							</MenubarMenu>
							<MenubarMenu>
								<MenubarTrigger className="px-[12px] py-[6px]">AAA</MenubarTrigger>
							</MenubarMenu>
							<MenubarMenu>
								<MenubarTrigger className="px-[12px] py-[6px]">AAA</MenubarTrigger>
							</MenubarMenu>
							<MenubarMenu>
								<MenubarTrigger className="px-[12px] py-[6px]">AAA</MenubarTrigger>
							</MenubarMenu>
						</Menubar>
					</div>
					<Button className="w-fit">Save</Button>
				</div>
			</div>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Members</p>
				<div className="max-w-[802px] flex flex-wrap gap-4">
					<MemberCard />
					<MemberCard />
					<MemberCard />
					<MemberCard />
					<MemberCard />
					<MemberCard />
				</div>
			</div>

			<p className="text-slate-800 text-3xl font-semibold">Dangerous Zone</p>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Quit Team</p>
				<Button className="w-fit">Quit</Button>
			</div>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Delete Project</p>
				<Button className="w-fit">Delete</Button>
			</div>
		</div>
	);
};

export default Settings;
