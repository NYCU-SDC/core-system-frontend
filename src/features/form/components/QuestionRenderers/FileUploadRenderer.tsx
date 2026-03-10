import * as formApi from "@/features/form/services/api";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { RefreshCw, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./FileUploadRenderer.module.css";

interface FileItem {
	id: string;
	file?: File;
	filename: string;
	serverInfo?: ServerFileInfo;
	status: "loading" | "uploading" | "success" | "error";
	error?: string;
}

export interface ServerFileInfo {
	fileId: string;
	originalFilename: string;
	contentType: string;
}

interface FileUploadRendererProps {
	responseId?: string;
	questionId: string;
	question: FormsQuestionResponse;
	maxFileAmount: number;
	allowedFileTypes: string;
	onFilesChange: (fileNames: string) => void;
	onFileMetadataChange?: (files: ServerFileInfo[]) => void;
	disabled?: boolean;
	initialFiles?: ServerFileInfo[];
}

export const FileUploadRenderer = ({
	responseId,
	question,
	questionId,
	maxFileAmount,
	allowedFileTypes,
	onFilesChange,
	onFileMetadataChange,
	disabled = false,
	initialFiles
}: FileUploadRendererProps) => {
	const [items, setItems] = useState<FileItem[]>([]);
	const itemsRef = useRef<FileItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const initialized = useRef(false);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	useEffect(() => {
		if (initialized.current) return;
		if (initialFiles === undefined) return; // data not yet loaded, wait
		initialized.current = true;
		if (initialFiles.length === 0) return;

		const placeholders: FileItem[] = initialFiles.map(f => ({
			id: crypto.randomUUID(),
			filename: f.originalFilename,
			serverInfo: f,
			status: "loading" as const
		}));
		setItems(placeholders);

		placeholders.forEach(async (placeholder, index) => {
			const info = initialFiles[index];
			try {
				const res = await fetch(`/api/files/${info.fileId}`, { credentials: "include" });
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const blob = await res.blob();
				const file = new File([blob], info.originalFilename, { type: info.contentType || blob.type });
				setItems(prev => {
					const next = prev.map(i => (i.id === placeholder.id ? { ...i, file, status: "success" as const } : i));
					onFilesChange(
						next
							.filter(i => i.status === "success")
							.map(i => i.filename)
							.join(",")
					);
					return next;
				});
			} catch {
				setItems(prev => prev.map(i => (i.id === placeholder.id ? { ...i, status: "error" as const, error: "下載失敗，請重新上傳" } : i)));
			}
		});
	}, [initialFiles, onFilesChange]);

	const doUploadBatch = async (batch: FileItem[]) => {
		if (!responseId || batch.length === 0) return;
		const batchIds = new Set(batch.map(i => i.id));
		const existingFiles = itemsRef.current.filter(i => !batchIds.has(i.id) && i.file).map(i => i.file as File);
		const newFiles = batch.map(i => i.file).filter((f): f is File => f !== undefined);
		const allFiles = [...existingFiles, ...newFiles];
		if (allFiles.length === 0) return;

		setItems(prev => prev.map(i => (batchIds.has(i.id) ? { ...i, status: "uploading" as const, error: undefined } : i)));
		try {
			const uploadResult = await formApi.uploadQuestionFiles(responseId, questionId, allFiles);
			const serverInfoMap = new Map(uploadResult.files.map(f => [f.originalFilename, { fileId: f.fileId, originalFilename: f.originalFilename, contentType: f.contentType } as ServerFileInfo]));
			setItems(prev => {
				const next = prev.map(i => ({
					...i,
					...(batchIds.has(i.id) ? { status: "success" as const } : {}),
					serverInfo: serverInfoMap.get(i.filename) ?? i.serverInfo
				}));
				onFilesChange(
					next
						.filter(i => i.status === "success")
						.map(i => i.filename)
						.join(",")
				);
				const updatedServerInfos = next.filter(i => i.status === "success" && i.serverInfo).map(i => i.serverInfo as ServerFileInfo);
				onFileMetadataChange?.(updatedServerInfos);
				return next;
			});
		} catch (err) {
			setItems(prev => prev.map(i => (batchIds.has(i.id) ? { ...i, status: "error" as const, error: (err as Error).message } : i)));
		}
	};

	const doUpload = async (item: FileItem) => {
		// If we already have a local File, just delegate to the batch uploader.
		if (item.file) {
			await doUploadBatch([item]);
			return;
		}

		// For initially-loaded items where the download failed, try re-downloading
		// the file from the server before uploading.
		if (!item.serverInfo) {
			// Nothing we can do without either a local file or server metadata.
			return;
		}

		// Mark the item as loading while we re-fetch the file content.
		setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "loading" as const, error: undefined } : i)));

		try {
			const { fileId, originalFilename, contentType } = item.serverInfo;
			const response = await fetch(`/api/files/${fileId}`);
			if (!response.ok) {
				throw new Error("下載失敗，請重新上傳");
			}

			const blob = await response.blob();
			const downloadedFile = new File([blob], originalFilename, { type: contentType });

			// Update the item in state with the newly created File.
			let updatedItem: FileItem | null = null;
			setItems(prev =>
				prev.map(i => {
					if (i.id !== item.id) return i;
					updatedItem = {
						...i,
						file: downloadedFile,
						filename: originalFilename
					};
					return updatedItem;
				})
			);

			// If for some reason the item was not found in state, abort gracefully.
			if (!updatedItem) {
				throw new Error("找不到要重新上傳的檔案項目");
			}

			// Now that we have a local File, reuse the batch upload logic.
			await doUploadBatch([updatedItem]);
		} catch (err) {
			const message = (err instanceof Error && err.message) || "下載失敗，請重新上傳";
			setItems(prev => prev.map(i => (i.id === item.id ? { ...i, status: "error" as const, error: message } : i)));
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
			filename: file.name,
			status: "uploading" as const
		}));
		if (inputRef.current) inputRef.current.value = "";
		setItems(prev => [...prev, ...toAdd]);
		doUploadBatch(toAdd);
	};

	const removeItem = async (id: string) => {
		const originalItems = itemsRef.current;
		const itemToRemove = originalItems.find(i => i.id === id);
		const remaining = originalItems.filter(i => i.id !== id);
		setItems(remaining);
		onFilesChange(
			remaining
				.filter(i => i.status === "success")
				.map(i => i.filename)
				.join(",")
		);
		const remainingServerInfos = remaining.filter(i => i.status === "success" && i.serverInfo).map(i => i.serverInfo as ServerFileInfo);
		onFileMetadataChange?.(remainingServerInfos);

		if (!responseId || itemToRemove?.status !== "success") return;

		try {
			const remainingFiles = remaining.filter(i => i.status === "success" && i.file).map(i => i.file as File);
			if (remainingFiles.length > 0) {
				const uploadResult = await formApi.uploadQuestionFiles(responseId, questionId, remainingFiles);
				const serverInfoMap = new Map(uploadResult.files.map(f => [f.originalFilename, { fileId: f.fileId, originalFilename: f.originalFilename, contentType: f.contentType } as ServerFileInfo]));
				setItems(prev => {
					const next = prev.map(i => ({ ...i, serverInfo: serverInfoMap.get(i.filename) ?? i.serverInfo }));
					onFileMetadataChange?.(next.filter(i => i.status === "success" && i.serverInfo).map(i => i.serverInfo as ServerFileInfo));
					return next;
				});
			} else {
				await formApi.clearQuestionFiles(responseId, questionId);
			}
		} catch {
			setItems(originalItems);
			onFilesChange(
				originalItems
					.filter(i => i.status === "success")
					.map(i => i.filename)
					.join(",")
			);
			onFileMetadataChange?.(originalItems.filter(i => i.status === "success" && i.serverInfo).map(i => i.serverInfo as ServerFileInfo));
		}
	};

	const activeCount = items.filter(i => i.status !== "error").length;
	const isLoadingFromServer = items.some(i => i.status === "loading");
	const canAddMore = !disabled && Boolean(responseId) && activeCount < maxFileAmount && !isLoadingFromServer;

	return (
		<>
			<div className={styles.fileUploadList}>
				{items.map(item => (
					<div
						key={item.id}
						className={`${styles.fileItem} ${item.status === "error" ? styles.fileItemError : item.status === "uploading" || item.status === "loading" ? styles.fileItemUploading : ""}`}
					>
						<span className={styles.fileItemName}>{item.filename}</span>
						{item.status === "uploading" && <span className={styles.fileItemHint}>上傳中…</span>}
						{item.status === "loading" && <span className={styles.fileItemHint}>載入中…</span>}
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
			<p className={styles.fileItemHint}>
				最多 {question.uploadFile?.maxFileAmount || 1} 個檔案，每個檔案最大 {((question.uploadFile?.maxFileSizeLimit || 10485760) / 1024 / 1024).toFixed(0)} MB
			</p>
			{(!responseId || disabled) && <p className={styles.fileItemHint}>預覽模式不會上傳檔案。</p>}
		</>
	);
};
