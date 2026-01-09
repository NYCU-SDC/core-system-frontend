import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof RadixCheckbox.Root> {
	label?: string;
	themeColor?: string;
}

export function Checkbox({ label, themeColor, style, id, ...props }: CheckboxProps) {
	const checkboxStyle = themeColor ? { ...style, borderColor: themeColor, backgroundColor: props.checked ? themeColor : undefined } : style;

	return (
		<div className={styles.wrapper}>
			<RadixCheckbox.Root className={styles.checkbox} style={checkboxStyle} id={id} {...props}>
				<RadixCheckbox.Indicator className={styles.indicator}>
					<Check size={16} />
				</RadixCheckbox.Indicator>
			</RadixCheckbox.Root>
			{label && (
				<Label.Root className={styles.label} htmlFor={id} data-disabled={props.disabled ? "" : undefined}>
					{label}
				</Label.Root>
			)}
		</div>
	);
}
