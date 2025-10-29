import { Link } from "react-router-dom";
import { Button } from "@/shared/components";
import styles from "./HomePage.module.css";

export const HomePage = () => {
	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<h1 className={styles.title}>Orange Component Library</h1>
				<p className={styles.subtitle}>Beautiful, accessible components built with Radix UI and CSS Modules</p>
				<div className={styles.heroButtons}>
					<Link to="/components">
						<Button size="large">View Components</Button>
					</Link>
					<Link to="/docs">
						<Button size="large">Read Docs</Button>
					</Link>
				</div>
			</section>

			<section className={styles.features}>
				<h2 className={styles.sectionTitle}>Why Core UI?</h2>
				<div className={styles.featureGrid}>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>🎨</div>
						<h3>Consistent Design</h3>
						<p>Orange borders and white backgrounds throughout for a cohesive look</p>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>♿</div>
						<h3>Accessible</h3>
						<p>Built on Radix UI primitives with full keyboard navigation</p>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>🎯</div>
						<h3>CSS Modules</h3>
						<p>Scoped styles with no conflicts using CSS variables</p>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>📱</div>
						<h3>Responsive</h3>
						<p>Works beautifully on all screen sizes</p>
					</div>
				</div>
			</section>

			<section className={styles.cta}>
				<h2>Ready to get started?</h2>
				<Link to="/components">
					<Button size="large">Explore Components</Button>
				</Link>
			</section>
		</div>
	);
};
