import MemberCard from "@/components/setting/MemberCard.tsx";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input.tsx";
import { useParams } from "react-router-dom";
import { UnitSelectorContainer, UnitSelectorContent } from "@/components/setting/UnitSelector.tsx";
import { useGetUnits } from "@/hooks/useGetUnits.ts";
import { useGetOrganizationMembers } from "@/hooks/useGetOrganizationMembers.ts";
import { useGetOrganization } from "@/hooks/useGetOrganization.ts";
import { useEffect, useState } from "react";

const Settings = () => {
	const { slug: organizationSlug } = useParams();
	const { data: units, isError: getUnitsError } = useGetUnits(organizationSlug!);
	const { data: members, isError: getMembersError } = useGetOrganizationMembers(organizationSlug!);
	const { data: organizationResponse, isError } = useGetOrganization(organizationSlug!);
	const [organization, setOrganization] = useState(organizationResponse);
	const [memberEmail, setMemberEmail] = useState("");

	useEffect(() => {
		setOrganization(organizationResponse);
	}, [organizationResponse]);

	if (isError) {
		return <p className="text-red-500">Failed to load organization</p>;
	}
	if (!organizationResponse) {
		return <p className="text-gray-500">Loading organization...</p>;
	}
	if (!organization) {
		return <p className="text-gray-500">Loading organization...</p>;
	}

	return (
		<div className="flex flex-col pl-32 pt-24 pr-8 pb-4 gap-8">
			<p className="text-slate-800 text-5xl font-bold">Settings</p>
			<p className="text-slate-800 text-3xl font-semibold">About</p>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Name</p>
				<div className="w-[350px] flex flex-col gap-6">
					<div>
						<p>Team Name</p>
						<Input
							className="mt-[6px]"
							value={organization.name}
							onChange={e => {
								setOrganization({ ...organization, name: e.target.value });
							}}
						/>
					</div>
					<div>
						<p>Slug</p>
						<Input
							className="mt-[6px]"
							value={organization.slug}
							onChange={e => {
								setOrganization({ ...organization, slug: e.target.value });
							}}
						/>
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
						<Input
							className="mt-[6px]"
							value={memberEmail}
							onChange={e => {
								setMemberEmail(e.target.value);
							}}
						/>
					</div>
					<div className="w-wrap">
						<p>Unit</p>
						<UnitSelectorContainer>
							{getUnitsError ? (
								<p className="text-red-500 py-1.5 px-3">Failed to load units</p>
							) : !units ? (
								<p className="text-gray-500 py-1.5 px-3">Loading units...</p>
							) : units.length === 0 ? (
								<p className="text-gray-500 py-1.5 px-3">No units available</p>
							) : (
								units.map(unit => <UnitSelectorContent key={unit.id}>{unit.name}</UnitSelectorContent>)
							)}
						</UnitSelectorContainer>
					</div>
					<Button className="w-fit">Save</Button>
				</div>
			</div>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Members</p>
				<div className="max-w-[802px] flex flex-wrap gap-6 items-center">
					{getMembersError ? (
						<p className="text-red-500 text-center">Failed to load members</p>
					) : !members ? (
						<p className="text-gray-500  text-center">Loading members...</p>
					) : members.length === 0 ? (
						<p className="text-gray-500  text-center">No members available</p>
					) : (
						members.map(member => (
							<MemberCard
								key={member.id}
								name={member.name}
								avatarUrl={member.avatarUrl}
							/>
						))
					)}
				</div>
			</div>

			<p className="text-slate-800 text-3xl font-semibold">Dangerous Zone</p>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Quit Team</p>
				<Button className="w-fit bg-red-700">Quit</Button>
			</div>
			<div className="flex gap-[27px]">
				<p className="w-[170px] text-slate-400 text-2xl font-semibold">Delete Project</p>
				<Button className="w-fit bg-red-700">Delete</Button>
			</div>
		</div>
	);
};

export default Settings;
