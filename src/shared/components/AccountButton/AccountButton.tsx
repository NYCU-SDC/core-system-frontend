import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./AccountButton.module.css";

export interface AccountButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	logo: ReactNode;
	children: ReactNode;
	connected?: boolean;
}

export const AccountButton = ({ logo, children, connected = false, className, ...props }: AccountButtonProps) => {
	return (
		<button className={`${styles.button} ${connected ? styles.connected : ""} ${className || ""}`} {...props}>
			<div className={styles.logo}>{logo}</div>
			<div className={styles.content}>{children}</div>
			{connected && <span className={styles.badge}>Connected</span>}
		</button>
	);
};
