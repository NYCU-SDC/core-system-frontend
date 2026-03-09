import * as formApi from "@/features/form/services/api";
import { RefreshCw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./FileUploadQuestion.module.css";

interface FileItem {
	id: string;
	file: File;
	status: "uploading" | "success" | "error";
	error?: string;
}

interface FileUploadQuestionProps {
	responseId?: string;
	questionId: string;
	maxFileAmount: number;
	allowedFileTypes: string;
	onFilesChange: (fileNames: string) => void;
	disabled?: boolean;
}

export const FileUploadQuestion = ({ responseId, questionId, maxFileAmount, allowedFileTypes, onFilesChange, disabled = false }: FileUploadQuestionProps) => {
	const [items, setItems] = useState<FileItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const doUpload = async (item: FileItem) => {
		if (!responseId) return;
		setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "uploading" as const, error: undefined } : i)));
		try {
			await formApi.uploadQuestionFiles(responseId, questionId, [item.file]);
			setItems(prev => {
				const next = prev.map(i => (i.id === item.id ? { ...i, status: "success" as const } : i));
				onFilesChange(
					next
						.filter(i => i.status === "success")
						.map(i => i.file.name)
						.join(",")
				);
				return next;
			});
		} catch (err) {
			setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "error" as const, error: (err as Error).message } : i)));
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!responseId || disabled) return;
		const newFiles = Array.from(e.target.files || []);
		const activeCount = items.filter(i => i.status !== "error").length;
		const canAdd = Math.max(0, maxFileAmount - activeCount);
		const toAdd: FileItem[] = newFiles.slice(0, canAdd).map(file => ({
			id: crypto.randomUUID(),
			file,
			status: "uploading" as const
		}));
		if (inputRef.current) inputRef.current.value = "";
		setItems(prev => [...prev, ...toAdd]);
		toAdd.forEach(doUpload);
	};

	const removeItem = (id: string) => {
		setItems(prev => {
			const next = prev.filter(i => i.id !== id);
			onFilesChange(
				next
					.filter(i => i.status === "success")
					.map(i => i.file.name)
					.join(",")
			);
			return next;
		});
	};

	const activeCount = items.filter(i => i.status !== "error").length;
	const canAddMore = !disabled && Boolean(responseId) && activeCount < maxFileAmount;

	return (
		<div className={styles.fileUploadList}>
			{items.map(item => (
				<div key={item.id} className={`${styles.fileItem} ${item.status === "error" ? styles.fileItemError : item.status === "uploading" ? styles.fileItemUploading : ""}`}>
					<span className={styles.fileItemName}>{item.file.name}</span>
					{item.status === "uploading" && <span className={styles.fileItemHint}>上傳中…</span>}
					{item.status === "error" && <span className={styles.fileItemHint}>{item.error || "上傳失敗"}</span>}
					<div className={styles.fileItemActions}>
						{item.status === "error" && responseId && !disabled && (
							<button type="button" className={styles.fileRetryBtn} onClick={() => doUpload(item)}>
								<RefreshCw size={12} />
								重新上傳
							</button>
						)}
						{item.status !== "uploading" && (
							<button type="button" className={styles.fileRemoveBtn} onClick={() => removeItem(item.id)} aria-label="移除" disabled={disabled}>
								<X size={14} />
							</button>
						)}
					</div>
				</div>
			))}
			{canAddMore && (
				<label className={styles.fileAddZone}>
					<input ref={inputRef} type="file" multiple={maxFileAmount > 1} accept={allowedFileTypes} onChange={handleInputChange} className={styles.fileAddInput} />
					<Upload size={14} />
					<span>點擊上傳{maxFileAmount > 1 ? "（可多選）" : ""}</span>
				</label>
			)}
		</div>
	);
};
