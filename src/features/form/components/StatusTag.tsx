import styles from "./StatusTag.module.css";

export type StatusVariant = "published" | "draft" | "done";

export interface StatusTagProps {
	variant: StatusVariant;
	showDot?: boolean;
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
	published: { label: "已發佈", className: styles.published },
	draft: { label: "草稿", className: styles.draft },
	done: { label: "已結束", className: styles.done }
};

export const StatusTag = ({ variant, showDot = false }: StatusTagProps) => {
	const config = statusConfig[variant];

	return (
		<span className={`${styles.tag} ${config.className}`}>
			{showDot && <span className={styles.dot} />}
			{config.label}
		</span>
	);
};
