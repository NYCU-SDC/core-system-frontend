import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";
import { ToastContext } from "./toastContext";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	variant?: ToastVariant;
	duration?: number;
}

export interface ToastInput {
	title: string;
	description?: string;
	variant?: ToastVariant;
	duration?: number;
}

type ToastItem = ToastInput & {
	id: number;
	open: boolean;
};

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
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const nextToastId = useRef(0);
	const removeTimerMap = useRef<Map<number, number>>(new Map());

	const pushToast = (input: ToastInput) => {
		nextToastId.current += 1;
		setToasts(prev => [...prev, { id: nextToastId.current, open: true, ...input }]);
	};

	const dismissToast = (toastId: number) => {
		setToasts(prev => prev.map(toast => (toast.id === toastId ? { ...toast, open: false } : toast)));
		if (removeTimerMap.current.has(toastId)) return;
		const timerId = window.setTimeout(() => {
			setToasts(prev => prev.filter(toast => toast.id !== toastId));
			removeTimerMap.current.delete(toastId);
		}, 260);
		removeTimerMap.current.set(toastId, timerId);
	};

	useEffect(() => {
		const timerMap = removeTimerMap.current;
		return () => {
			timerMap.forEach(timerId => window.clearTimeout(timerId));
			timerMap.clear();
		};
	}, []);

	return (
		<ToastPrimitive.Provider>
			<ToastContext.Provider value={{ pushToast }}>
				{children}
				{toasts.map(toast => (
					<Toast
						key={toast.id}
						open={toast.open}
						onOpenChange={open => {
							if (!open) dismissToast(toast.id);
						}}
						title={toast.title}
						description={toast.description}
						variant={toast.variant}
						duration={toast.duration}
					/>
				))}
			</ToastContext.Provider>
			<ToastPrimitive.Viewport className={styles.viewport} />
		</ToastPrimitive.Provider>
	);
};
