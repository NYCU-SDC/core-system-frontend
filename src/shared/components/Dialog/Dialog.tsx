import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Dialog.module.css";

export interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	footer?: ReactNode;
	backgroundColor?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, backgroundColor }: DialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className={styles.overlay} style={backgroundColor ? { backgroundColor } : undefined} />
				<DialogPrimitive.Content className={styles.content}>
					<div className={styles.header}>
						<div>
							<DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
							{description && <DialogPrimitive.Description className={styles.description}>{description}</DialogPrimitive.Description>}
						</div>
						<DialogPrimitive.Close className={styles.close}>
							<X size={20} />
						</DialogPrimitive.Close>
					</div>
					<div className={styles.body}>{children}</div>
					{footer && <div className={styles.footer}>{footer}</div>}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
