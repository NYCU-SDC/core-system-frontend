import { type ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Inbox, FileText, Settings, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
		<>
			{/* Organization Button */}
			<div className="relative">
				<button
					className={cn(
						"w-10 h-10 rounded-lg transition-all duration-200",
						"bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20",
						"flex items-center justify-center text-slate-50 font-semibold text-sm shadow-sm"
					)}
					onClick={() => setIsOpen(true)}
					title={`Switch from ${currentOrg.name}`}
				>
					{currentOrg.initial}
				</button>
			</div>

			{/* Backdrop and Popup */}
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					style={{ backdropFilter: "blur(4px)" }}
					onClick={() => setIsOpen(false)}
				>
					<div
						className="bg-slate-50 rounded-xl shadow-2xl border border-slate-200 p-6 min-w-80 max-w-md mx-4"
						onClick={e => e.stopPropagation()}
					>
						<h3 className="text-lg font-semibold text-slate-900 mb-4">
							Switch Organization
						</h3>

						<div className="space-y-2">
							{organizations.map(org => (
								<button
									key={org.id}
									className={cn(
										"w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
										"hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/20",
										org.id === currentOrg.id
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
									{org.id === currentOrg.id && (
										<Check className="w-5 h-5 text-slate-600" />
									)}
								</button>
							))}
						</div>

						<div className="mt-4 pt-4 border-t border-slate-200">
							<button
								className="w-full p-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
								onClick={() => setIsOpen(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const NavItem = ({ icon, isActive = false, onClick, isProfile = false, label }: NavItemProps) => {
	if (isProfile) {
		return (
			<div className="group relative">
				<button
					className={cn(
						"p-3 rounded-lg transition-all duration-200 group relative",
						"hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/20",
						isActive && "bg-slate-100 ring-1 ring-slate-300"
					)}
					onClick={onClick}
					title={label}
				>
					<div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center shadow-sm">
						{icon}
					</div>
				</button>
				{/* Tooltip */}
				<div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-slate-50 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
					{label}
					<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="group relative">
			<button
				className={cn(
					"p-3 rounded-lg transition-all duration-200 group relative",
					"hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/20",
					isActive && "bg-slate-100 ring-1 ring-slate-300"
				)}
				onClick={onClick}
				title={label}
			>
				<div
					className={cn(
						"w-6 h-6 transition-colors duration-200",
						isActive ? "text-slate-700" : "text-slate-600 group-hover:text-slate-900"
					)}
				>
					{icon}
				</div>
			</button>
			{/* Tooltip */}
			<div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-slate-50 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
				{label}
				<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
			</div>
		</div>
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
