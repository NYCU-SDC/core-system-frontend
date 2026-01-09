import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
	variant?: "success" | "error" | "warning" | "info" | "default";
	showDot?: boolean;
}

export function Badge({ children, variant = "default", showDot = false, className, ...props }: BadgeProps) {
	const variantClass = styles[variant];

	return (
		<span className={`${styles.badge} ${variantClass} ${className || ""}`} {...props}>
			{showDot && <span className={styles.dot} />}
			{children}
		</span>
	);
}
