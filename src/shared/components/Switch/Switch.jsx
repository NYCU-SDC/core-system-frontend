import * as RadixSwitch from "@radix-ui/react-switch";
import styles from "./Switch.module.css";

export const Switch = ({ label, ...props }) => {
	if (label) {
		return (
			<label className={styles.label}>
				<RadixSwitch.Root
					className={styles.root}
					{...props}
				>
					<RadixSwitch.Thumb className={styles.thumb} />
				</RadixSwitch.Root>
				<span>{label}</span>
			</label>
		);
	}

	return (
		<RadixSwitch.Root
			className={styles.root}
			{...props}
		>
			<RadixSwitch.Thumb className={styles.thumb} />
		</RadixSwitch.Root>
	);
};
