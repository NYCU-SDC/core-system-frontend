import { Box, Card, Grid, Heading, Text } from "@radix-ui/themes";
import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";

const stats = [
	{ icon: Users, label: "Total Users", value: "1,234", change: "+12%" },
	{ icon: DollarSign, label: "Revenue", value: "$45,678", change: "+8%" },
	{ icon: BarChart3, label: "Active Projects", value: "56", change: "+23%" },
	{ icon: TrendingUp, label: "Growth", value: "23.5%", change: "+5%" }
];

export const DashboardPage = () => {
	return (
		<Box>
			<Heading size="8" mb="2">
				Dashboard
			</Heading>
			<Text color="gray" mb="6">
				Welcome back! Here's what's happening with your projects today.
			</Text>

			<Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4" mb="6">
				{stats.map(stat => {
					const Icon = stat.icon;
					return (
						<Card key={stat.label}>
							<Box p="4">
								<Box mb="3" style={{ color: "var(--accent-9)" }}>
									<Icon size={24} />
								</Box>
								<Text size="2" color="gray" style={{ display: "block" }} mb="1">
									{stat.label}
								</Text>
								<Heading size="6" mb="1">
									{stat.value}
								</Heading>
								<Text size="1" color="green">
									{stat.change}
								</Text>
							</Box>
						</Card>
					);
				})}
			</Grid>

			<Card>
				<Box p="5">
					<Heading size="4" mb="4">
						Recent Activity
					</Heading>
					<Text color="gray">No recent activity to show.</Text>
				</Box>
			</Card>
		</Box>
	);
};
