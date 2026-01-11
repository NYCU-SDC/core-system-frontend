import { Button } from "@/shared/components/Button/Button";
import { Dialog } from "@/shared/components/Dialog/Dialog";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import styles from "./ColorPicker.module.css";

export interface ColorPickerProps {
	label?: string;
	colors?: string[];
	value?: string;
	onChange?: (color: string) => void;
	allowCustom?: boolean;
}

const defaultColors = ["#ff5555", "#ffb86c", "#f1fa8c", "#50fa7b", "#8be9fd", "#bd93f9", "#ff79c6", "#6272a4"];

export const ColorPicker = ({ label, colors = defaultColors, value, onChange, allowCustom = true }: ColorPickerProps) => {
	const [showCustomDialog, setShowCustomDialog] = useState(false);
	const [customColor, setCustomColor] = useState(value || "#000000");

	const handleColorSelect = (color: string) => {
		onChange?.(color);
	};

	const handleCustomColorSubmit = () => {
		onChange?.(customColor);
		setShowCustomDialog(false);
	};

	return (
		<div className={styles.wrapper}>
			{label && <label className={styles.label}>{label}</label>}
			<div className={styles.colors}>
				{colors.map(color => (
					<button
						key={color}
						type="button"
						className={`${styles.colorCircle} ${value === color ? styles.selected : ""}`}
						style={{ backgroundColor: color }}
						onClick={() => handleColorSelect(color)}
						aria-label={`Select color ${color}`}
					>
						{value === color && (
							<span className={styles.checkmark}>
								<Check size={16} strokeWidth={3} />
							</span>
						)}
					</button>
				))}
				{allowCustom && (
					<button type="button" className={styles.addButton} onClick={() => setShowCustomDialog(true)} aria-label="Add custom color">
						<Plus size={20} />
					</button>
				)}
			</div>

			{allowCustom && (
				<Dialog
					open={showCustomDialog}
					onOpenChange={setShowCustomDialog}
					title="Custom Color"
					description="Enter a custom color in hex format"
					footer={
						<>
							<Button variant="secondary" onClick={() => setShowCustomDialog(false)}>
								Cancel
							</Button>
							<Button onClick={handleCustomColorSubmit}>Apply</Button>
						</>
					}
				>
					<div className={styles.dialogContent}>
						<input type="text" className={styles.customInput} placeholder="#000000" value={customColor} onChange={e => setCustomColor(e.target.value)} />
						<div className={styles.preview} style={{ backgroundColor: customColor }} />
					</div>
				</Dialog>
			)}
		</div>
	);
};
