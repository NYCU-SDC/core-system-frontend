import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import { Inbox, FileText, Settings, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetOrganizations } from "@/hooks/useGetOrganizations.ts";
import type { Organization } from "@/types/organization.ts";

interface NavItemProps {
	icon: ReactNode;
	isActive?: boolean;
	onClick?: () => void;
	isProfile?: boolean;
	label: string;
}

interface OrgSelectorProps {
	currentOrg: Organization;
	organizations: Organization[];
	onOrgChange: (org: Organization) => void;
}

const OrgSelector = ({ currentOrg, organizations, onOrgChange }: OrgSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"w-10 h-10 rounded-lg",
						"bg-slate-700 hover:bg-slate-600 text-slate-50 font-semibold text-sm shadow-sm",
						"focus:ring-2 focus:ring-slate-500/20"
					)}
				>
					{currentOrg.initial}
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-slate-50 border-slate-200">
				<DialogHeader>
					<DialogTitle className="text-slate-900">Switch Organization</DialogTitle>
				</DialogHeader>

				<div className="space-y-2 mt-4">
					{organizations.map(org => (
						<Button
							key={org.slug}
							variant="ghost"
							className={cn(
								"w-full justify-start gap-3 h-auto p-3",
								"hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20",
								org.slug === currentOrg.slug
									? "bg-slate-100 ring-1 ring-slate-300"
									: ""
							)}
							onClick={() => {
								onOrgChange(org);
								setIsOpen(false);
							}}
						>
							<div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-50 font-semibold text-sm">
								{org.initial}
							</div>
							<span className="text-slate-700 font-medium flex-1 text-left">
								{org.name}
							</span>
							{org.slug === currentOrg.slug && (
								<Check className="w-5 h-5 text-slate-600" />
							)}
						</Button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const NavItem = ({ icon, isActive = false, onClick, isProfile = false, label }: NavItemProps) => {
	if (isProfile) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"p-3 rounded-lg transition-all duration-200",
								"hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20",
								isActive && "bg-slate-100 ring-1 ring-slate-300"
							)}
							onClick={onClick}
						>
							<Avatar className="w-8 h-8 bg-slate-600">
								<AvatarFallback className="bg-slate-600 text-slate-50">
									{icon}
								</AvatarFallback>
							</Avatar>
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
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"p-3 rounded-lg transition-all duration-200",
							"hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20",
							isActive && "bg-slate-100 ring-1 ring-slate-300"
						)}
						onClick={onClick}
					>
						<div
							className={cn(
								"w-6 h-6 transition-colors duration-200",
								isActive ? "text-slate-700" : "text-slate-600 hover:text-slate-900"
							)}
						>
							{icon}
						</div>
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

	const { slug: orgSlug } = useParams();
	const [currentOrg, setCurrentOrg] = useState<Organization>();
	const { data: organizations, isError } = useGetOrganizations();

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
		} else if (organizations && organizations.length > 0) {
			setCurrentOrg({
				slug: organizations[0].slug,
				name: organizations[0].name,
				initial: organizations[0].name.charAt(0).toUpperCase()
			});
		}
	}, [organizations, orgSlug]);

	const handleOrgChange = (org: Organization) => {
		setCurrentOrg(org);
		navigate(`/${org.slug}/inbox`);
	};

	return (
		<div className="flex flex-col md:flex-row h-screen bg-slate-50">
			{/* Aside Navigation */}
			<aside className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-auto md:w-16 bg-slate-50 border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col justify-between px-4 md:px-0 md:py-4 shadow-sm z-50">
				{/* Top Section */}
				<div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 md:space-y-2 flex-1 md:justify-start justify-around">
					{/* Organization Selector */}
					{isError ? (
						<div
							className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm"
							title="Failed to load organizations"
						>
							!
						</div>
					) : !organizations || organizations.length === 0 ? (
						<div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse"></div>
					) : currentOrg ? (
						organizations.length > 0 && (
							<OrgSelector
								currentOrg={currentOrg}
								organizations={organizations.map(org => ({
									slug: org.slug,
									name: org.name,
									initial: org.name.charAt(0).toUpperCase()
								}))}
								onOrgChange={handleOrgChange}
							/>
						)
					) : null}

					{/* Inbox */}
					<NavItem
						icon={<Inbox className="w-full h-full" />}
						isActive={location.pathname === "/inbox"}
						onClick={() => {
							if (!currentOrg) {
								navigate("/inbox");
								return;
							}
							navigate(`/${currentOrg.slug}/inbox`);
						}}
						label="Inbox"
					/>

					{/* Form */}
					{currentOrg ? (
						<NavItem
							icon={<FileText className="w-full h=-full" />}
							isActive={location.pathname === `/${currentOrg.slug}/forms`}
							onClick={() => navigate(`/${currentOrg.slug}/forms`)}
							label="Forms"
						/>
					) : null}
				</div>

				{/* Bottom Section - Profile */}
				<div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 flex-1 md:justify-end justify-around">
					{/* Settings */}
					{currentOrg ? (
						<NavItem
							icon={<Settings className="w-full h=-full" />}
							isActive={location.pathname === `/${currentOrg.slug}/settings`}
							onClick={() => navigate(`/${currentOrg.slug}/settings`)}
							label="Settings"
						/>
					) : null}

					<NavItem
						icon={<User className="w-5 h-5 text-slate-50" />}
						isActive={location.pathname === "/profile"}
						onClick={() => navigate("/profile")}
						isProfile={true}
						label="Profile"
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
