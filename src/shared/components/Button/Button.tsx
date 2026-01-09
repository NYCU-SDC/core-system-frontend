import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	icon?: LucideIcon;
	themeColor?: string;
	variant?: "primary" | "secondary";
	processing?: boolean;
}

export const Button = ({ children, icon: Icon, themeColor, variant = "primary", processing = false, style, className, disabled, ...props }: ButtonProps) => {
	const buttonStyle = themeColor ? { ...style, backgroundColor: themeColor } : style;

	const variantClass = variant === "secondary" ? styles.secondary : styles.primary;

	return (
		<button className={`${styles.button} ${variantClass} ${className || ""}`} style={buttonStyle} disabled={disabled || processing} {...props}>
			{processing ? (
				<span className={`${styles.icon} ${styles.spinner}`}>
					<Loader2 size={20} />
				</span>
			) : Icon ? (
				<span className={styles.icon}>
					<Icon size={20} />
				</span>
			) : null}
			{children}
		</button>
	);
};
