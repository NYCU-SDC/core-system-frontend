import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	icon?: LucideIcon;
	simpleIcon?: ComponentType<{ size?: number; color?: string }>;
	themeColor?: string;
	variant?: "primary" | "secondary";
	processing?: boolean;
	iconPosition?: "left" | "right";
}

export const Button = ({
	children,
	icon: Icon,
	simpleIcon: SimpleIcon,
	themeColor,
	variant = "primary",
	processing = false,
	iconPosition = "left",
	style,
	className,
	disabled,
	...props
}: ButtonProps) => {
	const buttonStyle = themeColor ? { ...style, backgroundColor: themeColor } : style;

	const variantClass = variant === "secondary" ? styles.secondary : styles.primary;

	const iconContent = processing ? (
		<span className={`${styles.icon} ${styles.spinner}`}>
			<Loader2 size={20} />
		</span>
	) : SimpleIcon ? (
		<span className={styles.icon}>
			<SimpleIcon size={20} />
		</span>
	) : Icon ? (
		<span className={styles.icon}>
			<Icon size={20} />
		</span>
	) : null;

	return (
		<button className={`${styles.button} ${variantClass} ${className || ""}`} style={buttonStyle} disabled={disabled || processing} {...props}>
			{iconPosition === "left" ? iconContent : null}
			{children}
			{iconPosition === "right" ? iconContent : null}
		</button>
	);
};
