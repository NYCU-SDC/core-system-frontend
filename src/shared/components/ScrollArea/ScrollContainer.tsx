import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./ScrollContainer.module.css";

export interface ScrollContainerProps extends ComponentPropsWithoutRef<"div"> {
	children: ReactNode;
}

export const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
	({ children, className, ...props }, ref) => {
		const classes = [styles.scrollContainer, className].filter(Boolean).join(" ");

		return (
			<div ref={ref} className={classes} {...props}>
				{children}
			</div>
		);
	}
);

ScrollContainer.displayName = "ScrollContainer";
