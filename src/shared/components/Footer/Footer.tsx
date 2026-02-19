import { Facebook, Github, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

export const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<p className={styles.credit}>
					Core System 由 <a href="https://sdc-nycu.notion.site/welcome">NYCU SDC</a> 製作
				</p>
				<a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
					<Github size={20} />
				</a>
				<a href="https://instagram.com/nycu_sdc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
					<Instagram size={20} />
				</a>
				<a href="https://www.facebook.com/NYCUSDC/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
					<Facebook size={20} />
				</a>
			</div>
		</footer>
	);
};
