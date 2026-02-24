import { Button, Dialog } from "@/shared/components";
import { Check, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import styles from "./ColorPicker.module.css";

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
	s /= 100;
	v /= 100;
	const i = Math.floor(h / 60) % 6;
	const f = h / 60 - Math.floor(h / 60);
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const table: [number, number, number][] = [
		[v, t, p],
		[q, v, p],
		[p, v, t],
		[p, q, v],
		[t, p, v],
		[v, p, q]
	];
	const [r, g, b] = table[i];
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
	return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex: string): [number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	const v = max;
	const s = max === 0 ? 0 : d / max;
	let h = 0;
	if (d !== 0) {
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
		else if (max === g) h = ((b - r) / d + 2) / 6;
		else h = ((r - g) / d + 4) / 6;
	}
	return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

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
	const [hue, setHue] = useState(0);
	const [saturation, setSaturation] = useState(0);
	const [brightness, setBrightness] = useState(100);
	const [hexInput, setHexInput] = useState("#ffffff");

	const svPickerRef = useRef<HTMLDivElement>(null);
	const hueRef = useRef(hue);

	const currentHex = rgbToHex(...hsvToRgb(hue, saturation, brightness));
	const hueColor = rgbToHex(...hsvToRgb(hue, 100, 100));

	const handleColorSelect = (color: string) => {
		onChange?.(color);
	};

	const handleOpenDialog = () => {
		const initHex = value || "#000000";
		if (/^#[0-9a-f]{6}$/i.test(initHex)) {
			const [h, s, v] = hexToHsv(initHex);
			setHue(h);
			hueRef.current = h;
			setSaturation(s);
			setBrightness(v);
		}
		setHexInput(initHex);
		setShowCustomDialog(true);
	};

	const updateFromSvPicker = useCallback((clientX: number, clientY: number) => {
		const rect = svPickerRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
		const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
		const s = Math.round((x / rect.width) * 100);
		const v = Math.round((1 - y / rect.height) * 100);
		setSaturation(s);
		setBrightness(v);
		setHexInput(rgbToHex(...hsvToRgb(hueRef.current, s, v)));
	}, []);

	const handleSvMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			updateFromSvPicker(e.clientX, e.clientY);
			const onMouseMove = (e: MouseEvent) => updateFromSvPicker(e.clientX, e.clientY);
			const onMouseUp = () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		},
		[updateFromSvPicker]
	);

	const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const h = parseInt(e.target.value);
		setHue(h);
		hueRef.current = h;
		setHexInput(rgbToHex(...hsvToRgb(h, saturation, brightness)));
	};

	const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const hex = e.target.value;
		setHexInput(hex);
		if (/^#[0-9a-f]{6}$/i.test(hex)) {
			const [h, s, v] = hexToHsv(hex);
			setHue(h);
			hueRef.current = h;
			setSaturation(s);
			setBrightness(v);
		}
	};

	const handleCustomColorSubmit = () => {
		onChange?.(currentHex);
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
						aria-label={`選擇顏色 ${color}`}
					>
						{value === color && (
							<span className={styles.checkmark}>
								<Check size={16} strokeWidth={3} />
							</span>
						)}
					</button>
				))}
				{allowCustom &&
					(() => {
						const isCustomSelected = !!value && !colors.includes(value);
						return (
							<button
								type="button"
								className={`${styles.addButton} ${isCustomSelected ? styles.addButtonCustomSelected : ""}`}
								style={isCustomSelected ? { backgroundColor: value } : undefined}
								onClick={handleOpenDialog}
								aria-label="新增自訂顏色"
							>
								{isCustomSelected ? (
									<span className={styles.checkmark}>
										<Check size={16} strokeWidth={3} />
									</span>
								) : (
									<Plus size={20} />
								)}
							</button>
						);
					})()}
			</div>

			{allowCustom && (
				<Dialog
					open={showCustomDialog}
					onOpenChange={setShowCustomDialog}
					title="自訂顏色"
					description="從色盤中選擇顏色，或輸入 Hex 色碼"
					footer={
						<>
							<Button variant="secondary" onClick={() => setShowCustomDialog(false)}>
								取消
							</Button>
							<Button onClick={handleCustomColorSubmit}>套用</Button>
						</>
					}
				>
					<div className={styles.dialogContent}>
						{/* Saturation / Brightness picker */}
						<div ref={svPickerRef} className={styles.svPicker} style={{ background: `linear-gradient(to right, #fff, ${hueColor})` }} onMouseDown={handleSvMouseDown}>
							<div className={styles.svPickerOverlay} />
							<div
								className={styles.svCursor}
								style={{
									left: `${saturation}%`,
									top: `${100 - brightness}%`
								}}
							/>
						</div>

						{/* Hue slider */}
						<input type="range" min="0" max="360" value={hue} onChange={handleHueChange} className={styles.hueSlider} />

						{/* Preview + Hex input */}
						<div className={styles.colorInputRow}>
							<div className={styles.preview} style={{ backgroundColor: currentHex }} />
							<input type="text" className={styles.customInput} placeholder="#000000" value={hexInput} onChange={handleHexInputChange} spellCheck={false} />
						</div>
					</div>
				</Dialog>
			)}
		</div>
	);
};
