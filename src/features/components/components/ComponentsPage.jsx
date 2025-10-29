import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components";
import { componentsData } from "../services/componentData";
import styles from "./ComponentsPage.module.css";

const components = componentsData;

export const ComponentsPage = () => {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Components</h1>
				<p className={styles.subtitle}>Explore our collection of accessible, customizable components</p>
			</div>

			<div className={styles.grid}>
				{components.map(component => (
					<Link
						key={component.slug}
						to={`/components/${component.slug}`}
						className={styles.link}
					>
						<Card className={styles.card}>
							<CardHeader>
								<div className={styles.cardBadge}>{component.category}</div>
								<CardTitle>{component.name}</CardTitle>
								<CardDescription>{component.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<span className={styles.viewMore}>View Details →</span>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
};
