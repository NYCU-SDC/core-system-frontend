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
import type { UnitRequest, UnitResponse } from "@/types/unit.ts";
import { getOrganizationUnits } from "@/lib/request/getOrganizationUnits.ts";
import { updateOrganization } from "@/lib/request/updateOrganization.ts";
import { addOrganizationMember } from "@/lib/request/addOrganizationMember.ts";
import addUnit from "@/lib/request/addUnit.ts";
import { addUnitMember } from "@/lib/request/addUnitMember.ts";
import { deleteUnit } from "@/lib/request/deleteUnit.ts";
import { deleteMember } from "@/lib/request/deleteMember.ts";

const Settings = () => {
	const navigate = useNavigate();
	const { slug: organizationSlug } = useParams();
	const queryClient = useQueryClient();

	const [organization, setOrganization] = useState<OrganizationResponse>();
	const [units, setUnits] = useState<UnitResponse[]>([]);
	const [memberEmail, setMemberEmail] = useState("");
	const [newUnitName, setNewUnitName] = useState("");
	const [selectedUnit, setSelectedUnit] = useState<string[]>([]);

	// Fetch units and members
	const { data: unitsResponse, error: getUnitsError } = useQuery<UnitResponse[]>({
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

	const addOrgMemberMutation = useMutation({
		mutationKey: ["addMember", "organization"],
		mutationFn: (member: MemberRequest) => addOrganizationMember(organizationSlug!, member),
		onSuccess: async () => {
			setMemberEmail("");
			queryClient.invalidateQueries({ queryKey: ["organizationMembers", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to add member");
		}
	});

	const addUnitMemberMutation = useMutation({
		mutationKey: ["addMember", "unit"],
		mutationFn: ({ id, member }: { id: string; member: MemberRequest }) => addUnitMember(organizationSlug!, id, member),
		onSuccess: async () => {
			setMemberEmail("");
			setSelectedUnit([]);
			queryClient.invalidateQueries({ queryKey: ["organizationMembers", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to add member");
		}
	});

	const deleteMemberMutation = useMutation({
		mutationFn: (memberId: string) => deleteMember(organizationSlug!, memberId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["organizationMembers", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to delete member");
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

	const deleteUnitMutation = useMutation({
		mutationFn: (unitId: string) => deleteUnit(organizationSlug!, unitId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["organizationUnits", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to delete unit");
		}
	});

	const addUnitMutation = useMutation({
		mutationFn: (request: UnitRequest) => addUnit(organizationSlug!, request),
		onSuccess: () => {
			setNewUnitName("");
			queryClient.invalidateQueries({ queryKey: ["organizationUnits", organizationSlug!] });
		},
		onError: () => {
			toast.error("Failed to add unit");
		}
	});

	useEffect(() => {
		setOrganization(organizationResponse);
	}, [organizationResponse]);
	useEffect(() => {
		if (unitsResponse) setUnits(unitsResponse);
	}, [unitsResponse]);

	const handleAddMember = () => {
		addOrgMemberMutation.mutate({ email: memberEmail });
		for (const unitId of selectedUnit) {
			addUnitMemberMutation.mutate({ id: unitId, member: { email: memberEmail } });
		}
	};
	const handleDeleteMember = (memberId: string) => {
		deleteMemberMutation.mutate(memberId);
	};
	const handleUpdateOrganization = () => {
		if (!organization) return;
		updateOrganizationMutation.mutate({ name: organization.name, slug: organization.slug });
	};
	const handleAddUnit = () => {
		if (!newUnitName) return;
		addUnitMutation.mutate({ name: newUnitName });
	};
	const handleDeleteUnit = (unitId: string) => {
		setUnits(units.filter(unit => unit.id !== unitId));
		deleteUnitMutation.mutate(unitId);
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
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Name</p>
						<div className="max-w-87.5  flex flex-col gap-6">
							<div>
								<p>Team Name</p>
								<Input
									className="mt-1.5"
									value={organization.name}
									onChange={e => {
										setOrganization({ ...organization, name: e.target.value });
									}}
								/>
							</div>
							<div>
								<p>Slug</p>
								<Input
									className="mt-1.5"
									value={organization.slug}
									onChange={e => {
										setOrganization({ ...organization, slug: e.target.value });
									}}
								/>
							</div>
							<Button
								className="w-fit cursor-pointer"
								onClick={handleUpdateOrganization}
							>
								Save
							</Button>
						</div>
					</div>
					<p className="text-slate-800 text-3xl font-semibold">Team</p>
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Invite</p>
						<div className="max-w-87.5 flex flex-col gap-6">
							<div>
								<p>Email</p>
								<Input
									className="mt-1.5"
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
								className="w-fit cursor-pointer"
								onClick={handleAddMember}
							>
								Save
							</Button>
						</div>
					</div>
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Units</p>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<p>Current units</p>
								{getUnitsError ? (
									<p className="text-red-500 text-center">Failed to load units</p>
								) : !units ? (
									<p className="text-gray-500  text-center">Loading units...</p>
								) : units.length === 0 ? (
									<p className="text-gray-500  text-center">No units available</p>
								) : (
									units.map(unit => (
										<div className="flex gap-4 items-center">
											<p className="text-lg">{unit.name}</p>
											<Button
												className="bg-slate-200 text-slate-800 hover:bg-slate-300 cursor-pointer"
												onClick={() => handleDeleteUnit(unit.id)}
											>
												Delete
											</Button>
										</div>
									))
								)}
							</div>
							<div className="flex flex-col">
								<p>Create new unit</p>
								<Input
									className="mt-1.5"
									value={newUnitName}
									onChange={e => {
										setNewUnitName(e.target.value);
									}}
								/>
							</div>
							<Button
								className="w-fit"
								onClick={handleAddUnit}
							>
								Create
							</Button>
						</div>
					</div>
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Members</p>
						<div className="max-w-200.5 flex flex-wrap gap-6 items-center">
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
										id={member.id}
										avatarUrl={member.avatarUrl}
										onClick={handleDeleteMember}
									/>
								))
							)}
						</div>
					</div>
					<p className="text-slate-800 text-3xl font-semibold">Dangerous Zone</p>
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Quit Team</p>
						<Button className="w-fit bg-red-600 hover:bg-red-700 cursor-pointer">Quit</Button>
					</div>
					<div className="flex gap-6.75">
						<p className="max-w-42.5 text-slate-400 text-2xl font-semibold">Delete Project</p>
						<Button className="w-fit bg-red-600 hover:bg-red-700 cursor-pointer">Delete</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default Settings;
