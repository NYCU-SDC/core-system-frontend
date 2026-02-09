import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useState, type ReactNode } from "react";
import styles from "./Popover.module.css";

export interface PopoverProps {
	side?: "top" | "right" | "bottom" | "left";
	children: ReactNode;
	content: ReactNode | ((close: () => void) => ReactNode);
}

export const Popover = ({ side = "bottom", children, content }: PopoverProps) => {
	const [open, setOpen] = useState(false);

	const closePopover = () => setOpen(false);

	return (
		<PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
			<PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content className={styles.content} side={side} sideOffset={10}>
					{typeof content === "function" ? content(() => closePopover()) : content}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
};
