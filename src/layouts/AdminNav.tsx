import { Box, Flex, Text } from "@radix-ui/themes";
import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
	{ path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
	{ path: "/admin/users", icon: Users, label: "Users" },
	{ path: "/admin/settings", icon: Settings, label: "Settings" }
];

export const AdminNav = () => {
	const location = useLocation();

	return (
		<Box p="4">
			<Text size="5" weight="bold" mb="6" style={{ display: "block" }}>
				Admin Panel
			</Text>

			<Flex direction="column" gap="2">
				{navItems.map(item => {
					const Icon = item.icon;
					const isActive = location.pathname === item.path;

					return (
						<Link
							key={item.path}
							to={item.path}
							style={{
								textDecoration: "none",
								color: "inherit"
							}}
						>
							<Flex
								align="center"
								gap="3"
								p="3"
								style={{
									borderRadius: "var(--radius-2)",
									backgroundColor: isActive ? "var(--accent-9)" : "transparent",
									color: isActive ? "white" : "var(--gray-12)",
									cursor: "pointer",
									transition: "background-color 0.2s"
								}}
								onMouseEnter={e => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = "var(--gray-4)";
									}
								}}
								onMouseLeave={e => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								<Icon size={20} />
								<Text size="2" weight="medium">
									{item.label}
								</Text>
							</Flex>
						</Link>
					);
				})}

				<Box mt="6">
					<Link
						to="/"
						style={{
							textDecoration: "none",
							color: "inherit"
						}}
					>
						<Flex
							align="center"
							gap="3"
							p="3"
							style={{
								borderRadius: "var(--radius-2)",
								color: "var(--red-11)",
								cursor: "pointer",
								transition: "background-color 0.2s"
							}}
							onMouseEnter={e => {
								e.currentTarget.style.backgroundColor = "var(--red-3)";
							}}
							onMouseLeave={e => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<LogOut size={20} />
							<Text size="2" weight="medium">
								Logout
							</Text>
						</Flex>
					</Link>
				</Box>
			</Flex>
		</Box>
	);
};
