import { Checkbox, Input, Radio, type InputProps } from "@/shared/components";
import { forwardRef } from "react";
import styles from "./OptionsInput.module.css";

type OptionsInputType = "checkbox" | "radio" | "list";

export interface OptionsInputProps extends InputProps {
	ref?: React.Ref<HTMLInputElement>;
	type: OptionsInputType;
	index?: number;
}

export const OptionsInput = forwardRef<HTMLInputElement, OptionsInputProps>(({ label, type, ...props }, ref) => {
	return (
		<div className={styles.wrapper}>
			{type === "list" && <p>{props.index!!}.</p>}
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
			<Input ref={ref} {...props} />
		</div>
	);
});

OptionsInput.displayName = "OptionsInput";
