import { type ReactNode, useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import { Inbox, FileText, Settings, User, Check, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Organization, OrganizationResponse, OrganizationRequest } from "@/types/organization.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizations } from "@/lib/request/getOrganizations.ts";
import { createOrganization } from "@/lib/request/createOrganization.ts";
import { getUser } from "@/lib/request/getUser.ts";
import { toast } from "sonner";

interface NavItemProps {
	icon: ReactNode;
	isActive?: boolean;
	onClick?: () => void;
	isProfile?: boolean;
	label: string;
	avatarUrl?: string;
	userName?: string;
}

interface OrgSelectorProps {
	currentOrg: Organization;
	organizations: Organization[];
	onOrgChange: (org: Organization) => void;
	onOrgCreated: () => void;
}

export interface OrgSelectorHandle {
	open: () => void;
}

const OrgSelector = forwardRef<OrgSelectorHandle, OrgSelectorProps>(({ currentOrg, organizations, onOrgChange, onOrgCreated }, ref) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [formData, setFormData] = useState<OrganizationRequest>({
		name: "",
		slug: "",
		description: "",
		metadata: {}
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	// Expose the open method to parent components
	useImperativeHandle(ref, () => ({
		open: () => setIsOpen(true)
	}));

	const createMutation = useMutation({
		mutationFn: (data: OrganizationRequest) => createOrganization(data),
		onSuccess: (newOrg: OrganizationResponse) => {
			toast.success("Organization created successfully!");
			setIsCreateOpen(false);
			setFormData({ name: "", slug: "", description: "", metadata: {} });
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
			onOrgCreated();
			// Navigate to the new organization
			const org: Organization = {
				slug: newOrg.slug,
				name: newOrg.name,
				initial: newOrg.name.charAt(0).toUpperCase()
			};
			onOrgChange(org);
		},
		onError: (error: Error) => {
			toast.error(`Failed to create organization: ${error.message}`);
			setIsSubmitting(false);
		}
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim() || !formData.slug.trim()) {
			toast.error("Name and slug are required");
			return;
		}
		setIsSubmitting(true);
		createMutation.mutate(formData);
	};

	return (
		<>
			<Dialog
				open={isOpen}
				onOpenChange={setIsOpen}
			>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"w-10 h-10 rounded-lg font-semibold text-sm shadow-sm",
							organizations.length === 0 ? "bg-slate-200 hover:bg-slate-300 text-slate-600 border-2 border-dashed border-slate-400" : "bg-slate-700 hover:bg-slate-600 text-slate-50",
							"focus:ring-2 focus:ring-slate-500/20"
						)}
					>
						{currentOrg.initial}
					</Button>
				</DialogTrigger>

				<DialogContent className="bg-slate-50 border-slate-200">
					<DialogHeader>
						<DialogTitle className="text-slate-900">{organizations.length === 0 ? "Create Your First Organization" : "Switch Organization"}</DialogTitle>
					</DialogHeader>

					<div className="space-y-2 mt-4">
						{organizations.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-slate-600 mb-4">You don't have any organizations yet.</p>
								<Button
									variant="default"
									className="gap-2"
									onClick={() => {
										setIsOpen(false);
										setIsCreateOpen(true);
									}}
								>
									<Plus className="w-4 h-4" />
									Create Your First Organization
								</Button>
							</div>
						) : (
							<>
								{/* Home Button */}
								<Button
									variant="ghost"
									className="w-full justify-start gap-3 h-auto p-3 hover:bg-slate-100"
									onClick={() => {
										navigate("/inbox");
										setIsOpen(false);
									}}
								>
									<div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
										<Home className="w-5 h-5 text-slate-600" />
									</div>
									<span className="text-slate-700 font-medium flex-1 text-left">Overview</span>
								</Button>

								<div className="">
									{organizations.map(org => (
										<Button
											key={org.slug}
											variant="ghost"
											className={cn(
												"w-full justify-start gap-3 h-auto p-3",
												"hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20",
												org.slug === currentOrg.slug ? "bg-slate-100 ring-1 ring-slate-300" : ""
											)}
											onClick={() => {
												onOrgChange(org);
												setIsOpen(false);
											}}
										>
											<div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-50 font-semibold text-sm">{org.initial}</div>
											<span className="text-slate-700 font-medium flex-1 text-left">{org.name}</span>
											{org.slug === currentOrg.slug && <Check className="w-5 h-5 text-slate-600" />}
										</Button>
									))}
								</div>

								<div className="">
									<Button
										variant="outline"
										className="w-full justify-start gap-3 h-auto p-3"
										onClick={() => {
											setIsOpen(false);
											setIsCreateOpen(true);
										}}
									>
										<div className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-400 flex items-center justify-center">
											<Plus className="w-4 h-4 text-slate-600" />
										</div>
										<span className="text-slate-700 font-medium flex-1 text-left">Create New Organization</span>
									</Button>
								</div>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			>
				<DialogContent className="bg-slate-50 border-slate-200">
					<DialogHeader>
						<DialogTitle className="text-slate-900">Create New Organization</DialogTitle>
					</DialogHeader>

					<form
						onSubmit={handleSubmit}
						className="space-y-4 mt-4"
					>
						<div className="space-y-2">
							<Label htmlFor="name">Organization Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={e => setFormData({ ...formData, name: e.target.value })}
								placeholder="My Organization"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug">Slug *</Label>
							<Input
								id="slug"
								value={formData.slug}
								onChange={e => setFormData({ ...formData, slug: e.target.value })}
								placeholder="my-organization"
								pattern="[a-z0-9-]+"
								title="Only lowercase letters, numbers, and hyphens"
								required
							/>
							<p className="text-xs text-slate-500">Only lowercase letters, numbers, and hyphens</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								placeholder="Optional description"
								rows={3}
							/>
						</div>

						<div className="flex gap-2 justify-end pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Create Organization"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
});

OrgSelector.displayName = "OrgSelector";

const NavItem = ({ icon, isActive = false, onClick, isProfile = false, label, avatarUrl, userName }: NavItemProps) => {
	const getInitials = (name?: string) => {
		if (!name) return <User className="w-5 h-5" />;
		return name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (isProfile) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn("p-3 rounded-lg transition-all duration-200", "hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20", isActive && "bg-slate-100 ring-1 ring-slate-300")}
							onClick={onClick}
						>
							<Avatar className="w-8 h-8 bg-slate-600">
								{avatarUrl && (
									<AvatarImage
										src={avatarUrl}
										alt={userName || "User"}
									/>
								)}
								<AvatarFallback className="bg-slate-600 text-slate-50 text-sm">{getInitials(userName)}</AvatarFallback>
							</Avatar>
						</Button>
					</TooltipTrigger>
					<TooltipContent
						side="right"
						className="bg-slate-900 text-slate-50"
					>
						<p>{userName || label}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn("p-3 rounded-lg transition-all duration-200", "hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20", isActive && "bg-slate-100 ring-1 ring-slate-300")}
						onClick={onClick}
					>
						<div className={cn("w-6 h-6 flex items-center justify-center transition-colors duration-200", isActive ? "text-slate-700" : "text-slate-600 hover:text-slate-900")}>{icon}</div>
					</Button>
				</TooltipTrigger>
				<TooltipContent
					side="right"
					className="bg-slate-900 text-slate-50"
				>
					<p>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const AppLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const orgSelectorRef = useRef<OrgSelectorHandle>(null);

	const { slug: orgSlug } = useParams();
	const [currentOrg, setCurrentOrg] = useState<Organization>();
	const { data: organizations, isError } = useQuery<OrganizationResponse[]>({
		queryKey: ["organizations"],
		queryFn: getOrganizations
	});
	const { data: user } = useQuery({
		queryKey: ["user"],
		queryFn: getUser
	});

	useEffect(() => {
		if (orgSlug && organizations) {
			const org = organizations.find(o => o.slug === orgSlug);
			if (org) {
				setCurrentOrg({
					slug: org.slug,
					name: org.name,
					initial: org.name.charAt(0).toUpperCase()
				});
			}
		} else if (location.pathname === "/inbox") {
			// When on /inbox (home), clear the current org
			setCurrentOrg(undefined);
		} else if (!orgSlug && organizations && organizations.length > 0 && location.pathname !== "/inbox" && location.pathname !== "/profile") {
			// For other routes without orgSlug (but not /inbox or /profile), use first org
			setCurrentOrg({
				slug: organizations[0].slug,
				name: organizations[0].name,
				initial: organizations[0].name.charAt(0).toUpperCase()
			});
		}
	}, [organizations, orgSlug, location.pathname]);

	const handleOrgChange = (org: Organization) => {
		setCurrentOrg(org);
		navigate(`/${org.slug}/inbox`);
	};

	const handleOrgCreated = () => {
		// The query will be automatically refetched due to invalidation in the mutation
	};

	return (
		<div className="flex flex-col md:flex-row h-screen bg-slate-50">
			{/* Aside Navigation */}
			<aside className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-auto md:w-16 bg-slate-50 border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col justify-between px-4 md:px-0 md:py-4 shadow-sm z-50">
				{/* Top Section */}
				<div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 md:space-y-2 flex-1 md:justify-start justify-around">
					{/* Organization Selector - Always shown */}
					{isError ? (
						<div
							className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm"
							title="Failed to load organizations"
						>
							!
						</div>
					) : !organizations ? (
						<div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse"></div>
					) : organizations.length === 0 ? (
						<OrgSelector
							ref={orgSelectorRef}
							currentOrg={{ slug: "", name: "No Organization", initial: "+" }}
							organizations={[]}
							onOrgChange={handleOrgChange}
							onOrgCreated={handleOrgCreated}
						/>
					) : currentOrg ? (
						<OrgSelector
							ref={orgSelectorRef}
							currentOrg={currentOrg}
							organizations={organizations.map(org => ({
								slug: org.slug,
								name: org.name,
								initial: org.name.charAt(0).toUpperCase()
							}))}
							onOrgChange={handleOrgChange}
							onOrgCreated={handleOrgCreated}
						/>
					) : (
						<OrgSelector
							ref={orgSelectorRef}
							currentOrg={{ slug: "", name: "Select Organization", initial: <Home className="w-5 h-5" /> }}
							organizations={organizations.map(org => ({
								slug: org.slug,
								name: org.name,
								initial: org.name.charAt(0).toUpperCase()
							}))}
							onOrgChange={handleOrgChange}
							onOrgCreated={handleOrgCreated}
						/>
					)}

					{/* Inbox Button - Always shown */}
					<NavItem
						icon={<Inbox className="w-full h-full" />}
						isActive={(currentOrg && location.pathname === `/${currentOrg.slug}/inbox`) || (!currentOrg && location.pathname === "/inbox")}
						onClick={() => {
							if (currentOrg) {
								navigate(`/${currentOrg.slug}/inbox`);
							} else {
								navigate("/inbox");
							}
						}}
						label="Inbox"
					/>

					{/* Forms Button - Only shown when org is selected */}
					{currentOrg && (
						<NavItem
							icon={<FileText className="w-full h-full" />}
							isActive={location.pathname === `/${currentOrg.slug}/forms`}
							onClick={() => navigate(`/${currentOrg.slug}/forms`)}
							label="Forms"
						/>
					)}
				</div>

				{/* Bottom Section */}
				<div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 flex-1 md:justify-end justify-around gap-2">
					{/* Settings - Only shown when org is selected */}
					{currentOrg && (
						<NavItem
							icon={<Settings className="w-full h-full" />}
							isActive={location.pathname === `/${currentOrg.slug}/settings`}
							onClick={() => navigate(`/${currentOrg.slug}/settings`)}
							label="Settings"
						/>
					)}

					{/* Profile */}
					<NavItem
						icon={<User className="w-5 h-5 text-slate-50" />}
						isActive={location.pathname === "/profile"}
						onClick={() => navigate("/profile")}
						isProfile={true}
						label="Profile"
						avatarUrl={user?.avatarUrl}
						userName={user?.name}
					/>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 overflow-auto bg-slate-50 pb-16 md:pb-0">
				<Outlet
					context={{
						organization: currentOrg
					}}
				/>
			</main>
		</div>
	);
};

export default AppLayout;
