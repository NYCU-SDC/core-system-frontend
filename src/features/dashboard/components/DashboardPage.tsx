import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";
import styles from "./DashboardPage.module.css";

const stats = [
	{ icon: Users, label: "Total Users", value: "1,234", change: "+12%" },
	{ icon: DollarSign, label: "Revenue", value: "$45,678", change: "+8%" },
	{ icon: BarChart3, label: "Active Projects", value: "56", change: "+23%" },
	{ icon: TrendingUp, label: "Growth", value: "23.5%", change: "+5%" }
];

export const DashboardPage = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Dashboard</h1>
			<p className={styles.subtitle}>Welcome back! Here's what's happening with your projects today.</p>

			<div className={styles.grid}>
				{stats.map(stat => {
					const Icon = stat.icon;
					return (
						<div key={stat.label} className={styles.statCard}>
							<div className={styles.icon}>
								<Icon size={24} />
							</div>
							<span className={styles.statLabel}>{stat.label}</span>
							<div className={styles.statValue}>{stat.value}</div>
							<span className={styles.statChange}>{stat.change}</span>
						</div>
					);
				})}
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Recent Activity</h2>
				<p className={styles.cardContent}>No recent activity to show.</p>
			</div>
		</div>
	);
};
