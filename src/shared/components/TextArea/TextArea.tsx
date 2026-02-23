import * as Label from "@radix-ui/react-label";
import type { TextareaHTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import styles from "./TextArea.module.css";

export type TextAreaVariant = "outline" | "flushed";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	themeColor?: string;
	variant?: TextAreaVariant;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, themeColor, variant = "outline", className, style, ...props }, ref) => {
	const resolvedColor = themeColor?.startsWith("--") ? `var(${themeColor})` : themeColor;
	const textareaStyle = resolvedColor ? (variant === "flushed" ? ({ ...style, "--custom-border-color": resolvedColor } as React.CSSProperties) : { ...style, borderColor: resolvedColor }) : style;

	const innerRef = useRef<HTMLTextAreaElement>(null);

	const autoResize = useCallback((el: HTMLTextAreaElement) => {
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, []);

	// Resize on every value change when flushed
	useEffect(() => {
		if (variant !== "flushed") return;
		const el = innerRef.current;
		if (el) autoResize(el);
	}, [variant, props.value, props.defaultValue, autoResize]);

	const mergedRef = useCallback(
		(el: HTMLTextAreaElement | null) => {
			(innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
			if (typeof ref === "function") ref(el);
			else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
			// Initial size on mount
			if (el && variant === "flushed") autoResize(el);
		},
		[ref, variant, autoResize]
	);

	return (
		<div className={styles.wrapper}>
			{label && (
				<Label.Root className={styles.label} htmlFor={props.id}>
					{label}
				</Label.Root>
			)}
			<textarea ref={mergedRef} className={`${styles.textarea} ${styles[variant]} ${error ? styles.error : ""} ${className || ""}`} style={textareaStyle} {...props} />
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
});

TextArea.displayName = "TextArea";
