import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import styles from "./RadioCard.module.css";

export interface RadioCardOption {
	value: string;
	title: string;
	description: ReactNode;
	disabled?: boolean;
}

export interface RadioCardProps extends ComponentPropsWithoutRef<typeof RadioGroup.Root> {
	options: RadioCardOption[];
	themeColor?: string;
}

export const RadioCard = ({ options, themeColor, ...props }: RadioCardProps) => {
	return (
		<RadioGroup.Root className={styles.radioGroup} {...props}>
			{options.map(option => {
				const cardStyle: CSSProperties = themeColor ? { borderColor: themeColor, ["--indicator-color" as any]: themeColor } : {};

				return (
					<label
						key={option.value}
						className={styles.radioCard}
						data-state={props.value === option.value ? "checked" : "unchecked"}
						data-disabled={option.disabled ? "" : undefined}
						style={props.value === option.value ? cardStyle : undefined}
					>
						<RadioGroup.Item className={styles.radioButton} value={option.value} disabled={option.disabled}>
							<RadioGroup.Indicator className={styles.indicator} />
						</RadioGroup.Item>
						<div className={styles.content}>
							<div className={styles.title}>{option.title}</div>
							<div className={styles.description}>{option.description}</div>
						</div>
					</label>
				);
			})}
		</RadioGroup.Root>
	);
};
