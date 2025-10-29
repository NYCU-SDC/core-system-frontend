import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components";
import { docCategories } from "../services/docsData";
import styles from "./DocsPage.module.css";

export const DocsPage = () => {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Documentation</h1>
				<p className={styles.subtitle}>Everything you need to know about using Core UI</p>
			</div>

			{docCategories.map(category => (
				<section
					key={category.category}
					className={styles.section}
				>
					<h2 className={styles.categoryTitle}>{category.title}</h2>
					<p className={styles.categoryDescription}>{category.description}</p>
					<div className={styles.grid}>
						{category.docs.map(doc => (
							<Link
								key={doc.slug}
								to={`/docs/${category.category}/${doc.slug}`}
								className={styles.link}
							>
								<Card className={styles.card}>
									<CardHeader>
										<CardTitle>{doc.title}</CardTitle>
										<CardDescription>{doc.description}</CardDescription>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
				</section>
			))}
		</div>
	);
};
