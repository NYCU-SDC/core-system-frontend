import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { ScrollContainer } from "../ScrollArea/ScrollContainer";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	footer?: ReactNode;
	backgroundColor?: string;
	size?: DialogSize;
}

const sizeClassNameMap: Record<DialogSize, string> = {
	sm: styles.contentSm,
	md: styles.contentMd,
	lg: styles.contentLg,
	xl: styles.contentXl
};

export const Dialog = ({ open, onOpenChange, title, description, children, footer, backgroundColor, size = "md" }: DialogProps) => {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className={styles.overlay} style={backgroundColor ? { backgroundColor } : undefined} />
				<DialogPrimitive.Content className={`${styles.content} ${sizeClassNameMap[size]}`}>
					<div className={styles.header}>
						<DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
						{description && <DialogPrimitive.Description className={styles.description}>{description}</DialogPrimitive.Description>}
						<DialogPrimitive.Close className={styles.close} aria-label="關閉對話框">
							<X size={20} />
						</DialogPrimitive.Close>
					</div>
					<ScrollContainer className={styles.body}>{children}</ScrollContainer>
					{footer && <div className={styles.footer}>{footer}</div>}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
};
