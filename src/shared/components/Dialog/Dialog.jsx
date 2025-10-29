import * as RadixDialog from "@radix-ui/react-dialog";
import styles from "./Dialog.module.css";

export const Dialog = ({ children, ...props }) => {
	return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
};

export const DialogTrigger = RadixDialog.Trigger;

export const DialogContent = ({ children, ...props }) => {
	return (
		<RadixDialog.Portal>
			<RadixDialog.Overlay className={styles.overlay} />
			<RadixDialog.Content
				className={styles.content}
				{...props}
			>
				{children}
				<RadixDialog.Close className={styles.close}>
					<span aria-hidden>×</span>
				</RadixDialog.Close>
			</RadixDialog.Content>
		</RadixDialog.Portal>
	);
};

export const DialogTitle = ({ children }) => {
	return <RadixDialog.Title className={styles.title}>{children}</RadixDialog.Title>;
};

export const DialogDescription = ({ children }) => {
	return <RadixDialog.Description className={styles.description}>{children}</RadixDialog.Description>;
};
