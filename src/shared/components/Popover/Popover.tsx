import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import styles from "./Popover.module.css";

export interface PopoverProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	side?: "top" | "right" | "bottom" | "left";
	children: ReactNode;
	content: ReactNode;
}

export const Popover = ({ open, onOpenChange, side = "bottom", children, content }: PopoverProps) => {
	return (
		<PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content className={styles.content} side={side} sideOffset={10}>
					{content}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
};
