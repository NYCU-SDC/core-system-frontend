import { Facebook, Github, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

export const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.left}>
					<p>
						Core System by{" "}
						<a href="https://sdc-nycu.notion.site/welcome" className={styles.link}>
							NYCU SDC
						</a>
					</p>
				</div>
				<div className={styles.right}>
					<a href="https://github.com" target="_blank" rel="noopener noreferrer">
						<Github size={20} />
					</a>
					<a href="https://instagram.com/nycu_sdc" target="_blank" rel="noopener noreferrer">
						<Instagram size={20} />
					</a>
					<a href="https://www.facebook.com/NYCUSDC/" target="_blank" rel="noopener noreferrer">
						<Facebook size={20} />
					</a>
				</div>
			</div>
		</footer>
	);
};
