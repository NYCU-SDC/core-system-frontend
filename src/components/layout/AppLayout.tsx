import { type ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Inbox, FileText, Settings, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppLayoutProps {
	children: ReactNode;
}

interface Organization {
	id: string;
	name: string;
	initial: string;
}

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
					className={cn("w-10 h-10 rounded-lg", "bg-slate-700 hover:bg-slate-600 text-slate-50 font-semibold text-sm shadow-sm", "focus:ring-2 focus:ring-slate-500/20")}
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
							key={org.id}
							variant="ghost"
							className={cn(
								"w-full justify-start gap-3 h-auto p-3",
								"hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20",
								org.id === currentOrg.id ? "bg-slate-100 ring-1 ring-slate-300" : ""
							)}
							onClick={() => {
								onOrgChange(org);
								setIsOpen(false);
							}}
						>
							<div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-50 font-semibold text-sm">{org.initial}</div>
							<span className="text-slate-700 font-medium flex-1 text-left">{org.name}</span>
							{org.id === currentOrg.id && <Check className="w-5 h-5 text-slate-600" />}
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
							className={cn("p-3 rounded-lg transition-all duration-200", "hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20", isActive && "bg-slate-100 ring-1 ring-slate-300")}
							onClick={onClick}
						>
							<Avatar className="w-8 h-8 bg-slate-600">
								<AvatarFallback className="bg-slate-600 text-slate-50">{icon}</AvatarFallback>
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
						className={cn("p-3 rounded-lg transition-all duration-200", "hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/20", isActive && "bg-slate-100 ring-1 ring-slate-300")}
						onClick={onClick}
					>
						<div className={cn("w-6 h-6 transition-colors duration-200", isActive ? "text-slate-700" : "text-slate-600 hover:text-slate-900")}>{icon}</div>
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

const AppLayout = ({ children }: AppLayoutProps) => {
	const location = useLocation();
	const navigate = useNavigate();

	// Mock organizations data - replace with real data from your API/store
	const [organizations] = useState<Organization[]>([
		{ id: "1", name: "Acme Corporation", initial: "A" },
		{ id: "2", name: "Beta Solutions", initial: "B" },
		{ id: "3", name: "Gamma Technologies", initial: "G" },
		{ id: "4", name: "Delta Industries", initial: "D" }
	]);

	const [currentOrg, setCurrentOrg] = useState<Organization>(organizations[0]);

	const handleNavigation = (path: string) => {
		navigate(path);
	};

	const handleOrgChange = (org: Organization) => {
		setCurrentOrg(org);
		// Add your organization switching logic here
		console.log("Switched to organization:", org.name);
	};

	return (
		<div className="flex h-screen bg-slate-50">
			{/* Aside Navigation */}
			<aside className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col justify-between py-4 shadow-sm">
				{/* Top Section */}
				<div className="flex flex-col items-center space-y-2">
					{/* Organization Selector */}
					<OrgSelector
						currentOrg={currentOrg}
						organizations={organizations}
						onOrgChange={handleOrgChange}
					/>

					{/* Inbox */}
					<NavItem
						icon={<Inbox className="w-full h-full" />}
						isActive={location.pathname === "/inbox"}
						onClick={() => handleNavigation("/inbox")}
						label="Inbox"
					/>

					{/* Form */}
					<NavItem
						icon={<FileText className="w-full h-full" />}
						isActive={location.pathname === "/forms"}
						onClick={() => handleNavigation("/forms")}
						label="Forms"
					/>
				</div>

				{/* Bottom Section - Profile */}
				<div className="flex flex-col items-center">
					{/* Settings */}
					<NavItem
						icon={<Settings className="w-full h-full" />}
						isActive={location.pathname === "/settings"}
						onClick={() => handleNavigation("/settings")}
						label="Settings"
					/>
					<NavItem
						icon={<User className="w-5 h-5 text-slate-50" />}
						isActive={location.pathname === "/profile"}
						onClick={() => handleNavigation("/profile")}
						isProfile={true}
						label="Profile"
					/>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 overflow-auto bg-slate-50">{children}</main>
		</div>
	);
};

export default AppLayout;
