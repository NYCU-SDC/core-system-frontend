import * as Label from "@radix-ui/react-label";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Select.module.css";

export interface SelectOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
	disabled?: boolean;
}

export interface SelectProps extends ComponentPropsWithoutRef<typeof RadixSelect.Root> {
	label?: string;
	placeholder?: string;
	options: SelectOption[];
	error?: string;
	themeColor?: string;
	variant?: "default" | "text";
}

export const Select = ({ label, placeholder, options, error, themeColor, variant = "default", ...props }: SelectProps) => {
	const triggerId = `select-${label?.replace(/\s/g, "-").toLowerCase()}`;

	return (
		<div className={styles.wrapper}>
			{label && (
				<Label.Root className={styles.label} htmlFor={triggerId}>
					{label}
				</Label.Root>
			)}
			<RadixSelect.Root modal={false} {...props}>
				<RadixSelect.Trigger
					className={`${styles.trigger} ${error ? styles.error : ""} ${variant === "text" ? styles.text : ""}`}
					id={triggerId}
					style={themeColor ? { borderColor: themeColor } : undefined}
				>
					<RadixSelect.Value placeholder={placeholder || "請選擇一個選項"} />
					{variant !== "text" && (
						<RadixSelect.Icon className={styles.icon}>
							<ChevronDown size={16} />
						</RadixSelect.Icon>
					)}
				</RadixSelect.Trigger>

				<RadixSelect.Portal>
					<RadixSelect.Content className={styles.content} position="popper">
						<RadixSelect.Viewport className={styles.viewport}>
							{options.map(option => (
								<RadixSelect.Item key={option.value} value={option.value} className={styles.item} disabled={option.disabled}>
									<RadixSelect.ItemText>
										{option.icon} {option.label}
									</RadixSelect.ItemText>
								</RadixSelect.Item>
							))}
						</RadixSelect.Viewport>
					</RadixSelect.Content>
				</RadixSelect.Portal>
			</RadixSelect.Root>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};
