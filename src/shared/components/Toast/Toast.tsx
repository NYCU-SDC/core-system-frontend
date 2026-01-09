import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

export interface ToastProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	variant?: "success" | "error" | "warning" | "info";
	duration?: number;
}

const icons = {
	success: CheckCircle,
	error: XCircle,
	warning: AlertCircle,
	info: Info
};

export const Toast = ({ open, onOpenChange, title, description, variant = "info", duration = 5000 }: ToastProps) => {
	const Icon = icons[variant];

	return (
		<ToastPrimitive.Root className={styles.root} open={open} onOpenChange={onOpenChange} duration={duration}>
			<div className={`${styles.icon} ${styles[variant]}`}>
				<Icon size={20} />
			</div>
			<div className={styles.content}>
				<ToastPrimitive.Title className={styles.title}>{title}</ToastPrimitive.Title>
				{description && <ToastPrimitive.Description className={styles.description}>{description}</ToastPrimitive.Description>}
			</div>
			<ToastPrimitive.Close className={styles.close}>
				<X size={16} />
			</ToastPrimitive.Close>
		</ToastPrimitive.Root>
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	return (
		<ToastPrimitive.Provider>
			{children}
			<ToastPrimitive.Viewport className={styles.viewport} />
		</ToastPrimitive.Provider>
	);
};
