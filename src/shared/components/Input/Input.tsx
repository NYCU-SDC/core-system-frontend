import * as Label from "@radix-ui/react-label";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import styles from "./Input.module.css";

export type InputVariant = "outline" | "flushed" | "none";

export type InputTextSize = "default" | "h2";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	themeColor?: string;
	variant?: InputVariant;
	textSize?: InputTextSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, themeColor, className, style, variant = "outline", textSize = "default", ...props }, ref) => {
	const resolvedThemeColor = (color?: string) => {
		if (!color) return undefined;
		return color?.startsWith("--") ? `var(${color})` : color;
	};

	const themeColorValue = resolvedThemeColor(themeColor);

	const inputStyle = themeColorValue ? ({ ...style, "--custom-border-color": themeColorValue } as React.CSSProperties) : style;

	const inputClasses = [styles.input, styles[variant], styles[`text-${textSize}`], error ? styles.error : ""].join(" ");

	const wrapperClasses = [styles.wrapper, className].join(" ");

	return (
		<div className={wrapperClasses}>
			{label && (
				<Label.Root className={styles.label} htmlFor={props.id}>
					{label}
				</Label.Root>
			)}
			<input ref={ref} className={inputClasses} style={inputStyle} {...props} />
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
});

Input.displayName = "Input";
