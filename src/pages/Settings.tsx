import MemberCard from "@/components/setting/MemberCard.tsx";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { UnitSelectorContainer, UnitSelectorContent } from "@/components/setting/UnitSelector.tsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Member, MemberRequest, OrganizationRequest, OrganizationResponse } from "@/types/organization.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganization } from "@/lib/request/getOrganization.ts";
import { getOrganizationMembers } from "@/lib/request/getOrganizationMembers.ts";
import type { UnitResponse } from "@/types/unit.ts";
import { getOrganizationUnits } from "@/lib/request/getOrganizationUnits.ts";
import { updateOrganization } from "@/lib/request/updateOrganization.ts";
import { addMember } from "@/lib/request/addMember.ts";

const Settings = () => {
	const navigate = useNavigate();
	const { slug: organizationSlug } = useParams();
	const queryClient = useQueryClient();

	const [organization, setOrganization] = useState<OrganizationResponse | undefined>();
	const [memberEmail, setMemberEmail] = useState("");
	const [selectedUnit, setSelectedUnit] = useState<string[]>([]);

	// Fetch units and members
	const { data: units, error: getUnitsError } = useQuery<UnitResponse[]>({
		queryKey: ["organizationUnits", organizationSlug],
		queryFn: () => getOrganizationUnits(organizationSlug!),
		enabled: !!organizationSlug,
		placeholderData: []
	});
	const { data: members, error: getMembersError } = useQuery<Member[]>({
		queryKey: ["organizationMembers", organizationSlug],
		queryFn: () => getOrganizationMembers(organizationSlug!),
		enabled: !!organizationSlug,
		placeholderData: []
	});
	const { data: organizationResponse, error: getOrganizationError } = useQuery<OrganizationResponse>({
		queryKey: ["organization", organizationSlug],
		queryFn: () => getOrganization(organizationSlug!)
	});

	const addMemberMutation = useMutation({
		mutationKey: ["addMember"],
		mutationFn: (member: MemberRequest) => addMember(organizationSlug!, member),
		onSuccess: async () => {
			setMemberEmail("");
			queryClient.invalidateQueries({ queryKey: ["organizationMembers", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to add member");
		}
	});

	const updateOrganizationMutation = useMutation({
		mutationFn: (request: OrganizationRequest) => updateOrganization(organizationSlug!, request),
		onSuccess: () => {
			toast.success("Organization updated");
			queryClient.invalidateQueries({ queryKey: ["organization", organizationSlug] });
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
			if (organization && organization.slug !== organizationSlug) {
				navigate(`/${organization.slug}/settings`, { replace: true });
			}
		},
		onError: () => {
			toast.error("Failed to update organization");
		}
	});

	useEffect(() => {
		setOrganization(organizationResponse);
	}, [organizationResponse]);

	const handleAddMember = () => {
		addMemberMutation.mutate({ email: memberEmail });
	};
	const handleUpdateOrganization = () => {
		if (!organization) return;
		updateOrganizationMutation.mutate({ name: organization.name, slug: organization.slug });
	};

	return (
		<div className="flex flex-col pl-32 pt-24 pr-8 pb-4 gap-8">
			<p className="text-slate-800 text-5xl font-bold">Settings</p>
			{getOrganizationError ? (
				<p className="text-red-500">Failed to load organization</p>
			) : !organization ? (
				<p className="text-gray-500">Loading organization...</p>
			) : (
				<>
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
							<Button
								className="w-fit"
								onClick={handleUpdateOrganization}
							>
								Save
							</Button>
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
								<UnitSelectorContainer
									value={selectedUnit}
									onSelect={setSelectedUnit}
								>
									{getUnitsError ? (
										<p className="text-red-500 py-1.5 px-3">Failed to load units</p>
									) : !units ? (
										<p className="text-gray-500 py-1.5 px-3">Loading units...</p>
									) : units.length === 0 ? (
										<p className="text-gray-500 py-1.5 px-3">No units available</p>
									) : (
										units.map(unit => <UnitSelectorContent itemKey={unit.id}>{unit.name}</UnitSelectorContent>)
									)}
								</UnitSelectorContainer>
							</div>
							<Button
								className="w-fit"
								onClick={handleAddMember}
							>
								Save
							</Button>
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
						<Button className="w-fit bg-red-600 hover:bg-red-700">Quit</Button>
					</div>
					<div className="flex gap-[27px]">
						<p className="w-[170px] text-slate-400 text-2xl font-semibold">Delete Project</p>
						<Button className="w-fit bg-red-600 hover:bg-red-700">Delete</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default Settings;
