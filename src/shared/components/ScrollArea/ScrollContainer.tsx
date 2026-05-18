import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ScrollContainer.module.css";

export interface ScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export const ScrollContainer = ({ children, className, ...props }: ScrollContainerProps) => {
	const classes = [styles.scrollContainer, className].filter(Boolean).join(" ");

	return (
		<div className={classes} {...props}>
			{children}
		</div>
	);
};
