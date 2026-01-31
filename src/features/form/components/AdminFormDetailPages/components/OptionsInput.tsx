import { Checkbox, Input, Radio, type InputProps } from "@/shared/components";
import { forwardRef } from "react";
import styles from "./OptionsInput.module.css";

type OptionsInputType = "checkbox" | "radio" | "list";

export interface OptionsInputProps extends InputProps {
	ref?: React.Ref<HTMLInputElement>;
	type: OptionsInputType;
	listLabel?: string;
}

export const OptionsInput = forwardRef<HTMLInputElement, OptionsInputProps>(({ label, type, className, ...props }, ref) => {
	return (
		<div className={`${styles.wrapper} ${className}`}>
			{type === "list" && <p className={styles.listLabel}>{props.listLabel!!}</p>}
			{type === "checkbox" && <Checkbox disabled />}
			{type === "radio" && (
				<Radio
					options={[
						{
							value: "",
							label: "",
							disabled: true
						}
					]}
				/>
			)}
			<Input size={4} ref={ref} className={styles.input} {...props} />
		</div>
	);
});

OptionsInput.displayName = "OptionsInput";
