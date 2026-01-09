import * as Label from "@radix-ui/react-label";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import styles from "./Radio.module.css";

export interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface RadioProps extends ComponentPropsWithoutRef<typeof RadioGroup.Root> {
	options: RadioOption[];
	themeColor?: string;
}

export const Radio = ({ options, themeColor, ...props }: RadioProps) => {
	return (
		<RadioGroup.Root className={styles.radioGroup} {...props}>
			{options.map(option => {
				const itemId = `radio-${option.value}`;
				const radioStyle: CSSProperties = themeColor ? { borderColor: themeColor, ["--indicator-color" as string]: themeColor } : {};

				return (
					<div key={option.value} className={styles.radioItem}>
						<RadioGroup.Item className={styles.radio} value={option.value} id={itemId} disabled={option.disabled} style={radioStyle}>
							<RadioGroup.Indicator className={styles.indicator} />
						</RadioGroup.Item>
						<Label.Root className={styles.label} htmlFor={itemId} data-disabled={option.disabled ? "" : undefined}>
							{option.label}
						</Label.Root>
					</div>
				);
			})}
		</RadioGroup.Root>
	);
};
