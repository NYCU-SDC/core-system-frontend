import { File, Upload, X } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useRef, useState } from "react";
import styles from "./FileUpload.module.css";

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
	label?: string;
	onChange?: (file: File | null) => void;
	error?: string;
	accept?: string;
}

export function FileUpload({ label, onChange, error, accept = "image/*", ...props }: FileUploadProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			setFileName(file.name);

			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setPreview(null);
			}

			onChange?.(file);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		setPreview(null);
		setFileName(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
		onChange?.(null);
	};

	return (
		<div className={styles.container}>
			{label && <label className={styles.label}>{label}</label>}
			<div className={`${styles.uploadBox} ${error ? styles.error : ""}`}>
				<input ref={inputRef} type="file" className={styles.input} accept={accept} onChange={handleFileChange} {...props} />

				{preview ? (
					<div className={styles.preview}>
						<img src={preview} alt="Preview" className={styles.previewImage} />
						<button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="Remove file">
							<X size={16} />
						</button>
					</div>
				) : fileName ? (
					<>
						<div className={styles.icon}>
							<File size={48} />
						</div>
						<span className={styles.text}>{fileName}</span>
						<button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="Remove file">
							<X size={16} />
						</button>
					</>
				) : (
					<>
						<div className={styles.icon}>
							<Upload size={48} />
						</div>
						<span className={styles.text}>Click to upload</span>
					</>
				)}
			</div>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
}
