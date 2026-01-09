import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
	children: ReactNode;
	content: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	delayDuration?: number;
}

export const Tooltip = ({ children, content, side = "top", delayDuration = 200 }: TooltipProps) => {
	return (
		<TooltipPrimitive.Provider delayDuration={delayDuration}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					<span className={styles.trigger}>{children}</span>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content className={styles.content} side={side} sideOffset={5}>
						{content}
						<TooltipPrimitive.Arrow className={styles.arrow} />
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
