import type { HTMLAttributes } from "react";
import styles from "./StatusTag.module.css";

export type StatusVariant = "published" | "draft" | "done" | "archived";

export interface StatusTagProps {
	variant: StatusVariant;
	showDot?: boolean;
	label?: string;
	className?: string;
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
	published: { label: "已發佈", className: styles.published },
	draft: { label: "草稿", className: styles.draft },
	done: { label: "已結束", className: styles.done },
	archived: { label: "已封存", className: styles.archived }
};

export const StatusTag = ({ variant, showDot = false, label, className, ...props }: StatusTagProps & HTMLAttributes<HTMLSpanElement>) => {
	const config = statusConfig[variant];

	return (
		<span className={`${styles.tag} ${config.className} ${className || ""}`} {...props}>
			{showDot && <span className={styles.dot} />}
			{label ?? config.label}
		</span>
	);
};
