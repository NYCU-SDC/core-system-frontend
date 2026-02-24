import * as formApi from "@/features/form/services/api";
import { AccountButton, Checkbox, DateInput, DetailedCheckbox, DragToOrder, Input, Radio, ScaleInput, Select, TextArea } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { Chrome, Github, RefreshCw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./FormDetailPage.module.css";

const isValidUrl = (url: string): boolean => {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
};

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

const FileUploadQuestion = ({ responseId, questionId, maxFileAmount, allowedFileTypes, onFilesChange, disabled = false }: FileUploadQuestionProps) => {
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

type FormQuestionRendererProps = {
	question: FormsQuestionResponse;
	value: string;
	otherTextValue?: string;
	sourceQuestion?: FormsQuestionResponse;
	sourceAnswerValue?: string;
	responseId?: string;
	connectingOauthQuestionId?: string | null;
	disableFileUpload?: boolean;
	onAnswerChange: (questionId: string, value: string) => void;
	onOtherTextChange: (questionId: string, value: string) => void;
	onOauthConnect?: (question: FormsQuestionResponse) => void;
};

const getSelectedChoiceIds = (rawValue: string) => (rawValue ? rawValue.split(",").filter(Boolean) : []);

export const FormQuestionRenderer = ({
	question,
	value,
	otherTextValue = "",
	sourceQuestion,
	sourceAnswerValue = "",
	responseId,
	connectingOauthQuestionId = null,
	disableFileUpload = false,
	onAnswerChange,
	onOtherTextChange,
	onOauthConnect
}: FormQuestionRendererProps) => {
	switch (question.type) {
		case "SHORT_TEXT":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<Input id={question.id} placeholder="請輸入..." value={value} onChange={e => onAnswerChange(question.id, e.target.value)} required={question.required} />
				</div>
			);

		case "LONG_TEXT":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<TextArea id={question.id} placeholder="請輸入..." value={value} onChange={e => onAnswerChange(question.id, e.target.value)} rows={6} required={question.required} />
				</div>
			);

		case "SINGLE_CHOICE": {
			const choices = question.choices ?? [];
			const otherChoice = choices.find(choice => choice.isOther);

			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<Radio
						options={choices.map(choice => ({ value: choice.id, label: choice.name }))}
						value={value}
						onValueChange={newValue => {
							onAnswerChange(question.id, newValue);
							if (newValue !== otherChoice?.id) {
								onOtherTextChange(question.id, "");
							}
						}}
					/>
					{otherChoice && value === otherChoice.id && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
				</div>
			);
		}

		case "DROPDOWN": {
			const choices = question.choices ?? [];

			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<Select options={choices.map(choice => ({ value: choice.id, label: choice.name }))} value={value || undefined} onValueChange={newValue => onAnswerChange(question.id, newValue)} />
				</div>
			);
		}

		case "MULTIPLE_CHOICE": {
			const choices = question.choices ?? [];
			const otherChoice = choices.find(choice => choice.isOther);
			const selectedIds = getSelectedChoiceIds(value);

			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<div className={styles.choiceList}>
						{choices.map(choice => (
							<Checkbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								label={choice.name}
								checked={selectedIds.includes(choice.id)}
								onCheckedChange={checked => {
									const newValues = checked ? [...selectedIds, choice.id] : selectedIds.filter(v => v !== choice.id);
									onAnswerChange(question.id, newValues.join(","));
									if (otherChoice?.id === choice.id && !checked) {
										onOtherTextChange(question.id, "");
									}
								}}
							/>
						))}
					</div>
					{otherChoice && selectedIds.includes(otherChoice.id) && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
				</div>
			);
		}

		case "DETAILED_MULTIPLE_CHOICE":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<div className={styles.choiceList}>
						{question.choices?.map(choice => (
							<DetailedCheckbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								title={choice.name}
								description={choice.description || ""}
								checked={value.includes(choice.id)}
								onCheckedChange={checked => {
									const currentValues = value ? value.split(",") : [];
									const newValues = checked ? [...currentValues, choice.id] : currentValues.filter(v => v !== choice.id);
									onAnswerChange(question.id, newValues.join(","));
								}}
							/>
						))}
					</div>
				</div>
			);

		case "DATE":
			return (
				<DateInput
					key={question.id}
					id={question.id}
					label={question.title}
					description={question.description || undefined}
					value={value}
					options={question.date || { hasYear: true, hasMonth: true, hasDay: true }}
					required={question.required}
					onChange={newValue => onAnswerChange(question.id, newValue)}
				/>
			);

		case "LINEAR_SCALE":
		case "RATING":
			return (
				<ScaleInput
					key={question.id}
					id={question.id}
					label={question.title}
					description={question.description || undefined}
					value={value}
					options={question.scale || { minVal: 1, maxVal: 5 }}
					required={question.required}
					onChange={newValue => onAnswerChange(question.id, newValue)}
				/>
			);

		case "RANKING": {
			const isFromAnswerRanking = Boolean(question.sourceId);
			const rankingChoices = question.choices?.length ? question.choices : (sourceQuestion?.choices ?? []);
			const sourceSelectedIds = sourceAnswerValue ? sourceAnswerValue.split(",").filter(Boolean) : [];
			const shouldWaitSourceSelection = isFromAnswerRanking && sourceSelectedIds.length === 0;
			const allowedIds = sourceSelectedIds.length > 0 ? sourceSelectedIds : rankingChoices.map(choice => choice.id);
			const currentRankingIds = value
				? value
						.split(",")
						.filter(Boolean)
						.filter(id => allowedIds.includes(id))
				: [];
			const missingIds = allowedIds.filter(id => !currentRankingIds.includes(id));
			const displayIds = [...currentRankingIds, ...missingIds];

			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					{shouldWaitSourceSelection ? (
						<p className={styles.caption}>請先在「{sourceQuestion?.title || "來源題目"}」選擇至少一個項目，才可進行排序。</p>
					) : (
						<DragToOrder
							items={displayIds.map(choiceId => {
								const choice = rankingChoices.find(c => c.id === choiceId);
								return {
									id: choiceId,
									content: choice?.name || choiceId
								};
							})}
							onReorder={items => {
								onAnswerChange(question.id, items.map(item => item.id).join(","));
							}}
						/>
					)}
				</div>
			);
		}

		case "UPLOAD_FILE":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<FileUploadQuestion
						responseId={responseId}
						questionId={question.id}
						maxFileAmount={question.uploadFile?.maxFileAmount || 1}
						allowedFileTypes={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
						onFilesChange={fileNames => onAnswerChange(question.id, fileNames)}
						disabled={disableFileUpload}
					/>
					<p className={styles.uploadHint}>
						最多 {question.uploadFile?.maxFileAmount || 1} 個檔案，每個檔案最大 {((question.uploadFile?.maxFileSizeLimit || 10485760) / 1024 / 1024).toFixed(0)} MB
					</p>
					{(!responseId || disableFileUpload) && <p className={styles.uploadHint}>預覽模式不會上傳檔案。</p>}
				</div>
			);

		case "OAUTH_CONNECT":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<p className={styles.caption}>
						綁定平台：
						{question.oauthConnect === "GOOGLE" ? "Google" : "GitHub"}
					</p>
					<div className={styles.oauthConnectActions}>
						<AccountButton
							type="button"
							logo={question.oauthConnect === "GOOGLE" ? <Chrome size={20} /> : <Github size={20} />}
							connected={Boolean(value)}
							onClick={() => onOauthConnect?.(question)}
							disabled={!responseId || !onOauthConnect || connectingOauthQuestionId === question.id}
						>
							{connectingOauthQuestionId === question.id ? "綁定中" : value ? "重新綁定帳號" : "綁定帳號"}
						</AccountButton>
						<p className={styles.uploadHint}>{value ? `已綁定帳號：${value}` : "尚未綁定，點擊上方按鈕開始 OAuth 綁定流程。"}</p>
					</div>
				</div>
			);

		case "HYPERLINK":
			return (
				<div key={question.id} className={styles.questionField}>
					<label className={styles.questionLabel}>
						{question.title}
						{question.required && <span className={styles.requiredAsterisk}> *</span>}
					</label>
					{question.description && <div className={styles.questionDescription} dangerouslySetInnerHTML={{ __html: question.description }} />}
					<Input
						id={question.id}
						placeholder="https://"
						value={value}
						onChange={e => onAnswerChange(question.id, e.target.value)}
						required={question.required}
						error={value && !isValidUrl(value) ? "請輸入有效的網址（需以 http:// 或 https:// 開頭）" : ""}
					/>
				</div>
			);

		default:
			return (
				<div key={question.id} className={styles.questionField}>
					<p>不支援的問題類型: {question.type}</p>
					<p className={styles.caption}>{question.title}</p>
				</div>
			);
	}
};
