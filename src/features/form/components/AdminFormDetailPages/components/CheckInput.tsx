import { Checkbox, Input, Radio, type InputProps } from "@/shared/components";
import { forwardRef } from "react";
import styles from "./CheckInput.module.css";

type CheckInputType = "checkbox" | "radio";

export interface CheckInputProps extends InputProps {
	ref?: React.Ref<HTMLInputElement>;
	type: CheckInputType;
}

export const CheckInput = forwardRef<HTMLInputElement, CheckInputProps>(({ label, type, ...props }, ref) => {
	return (
		<div className={styles.wrapper}>
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

CheckInput.displayName = "CheckInput";
