import type { Question } from "@/features/form/components/AdminFormDetailPages/types/option";
import { Button, Checkbox, Input, Select, Switch, TextArea } from "@/shared/components";
import { FormsAllowedFileTypes } from "@nycu-sdc/core-system-sdk";
import {
	Calendar,
	CaseSensitive,
	Chrome,
	CloudUpload,
	Copy,
	Ellipsis,
	Github,
	LayoutList,
	Link2,
	List,
	ListOrdered,
	Rows3,
	ShieldCheck,
	SquareCheckBig,
	Star,
	TextAlignStart,
	Trash2
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DetailOptionsQuestion } from "./DetailOptionsQuestion";
import { OptionsQuestion } from "./OptionsQuestion";
import styles from "./QuestionCard.module.css";
import { RangeQuestion } from "./RangeQuestion";

export interface QuestionCardProps {
	question: Question;
	questionNumber?: number;
	defaultExpanded?: boolean;
	autoFocusTitle?: boolean;
	onTitleChange?: (newTitle: string) => void;
	onDescriptionChange?: (newDescription: string) => void;
	removeQuestion: () => void | Promise<void>;
	duplicateQuestion: () => void | Promise<void>;
	onAddOption?: () => void;
	onAddOtherOption?: () => void;
	onRemoveOption?: (optionIndex: number) => void;
	onRemoveOtherOption?: () => void;
	onAddDetailOption?: () => void;
	onDetailOptionChange?: (optionIndex: number, field: "label" | "description", value: string) => void;
	onRemoveDetailOption?: (optionIndex: number) => void;
	onChangeOption?: (optionIndex: number, newLabel: string) => void;
	onStartChange?: (newStart: number) => void;
	onEndChange?: (newEnd: number) => void;
	onStartLabelChange?: (label: string) => void;
	onEndLabelChange?: (label: string) => void;
	onChangeIcon?: (newIcon: Question["icon"]) => void;
	onToggleIsFromAnswer?: () => void;
	onSourceQuestionChange?: (sourceId: string) => void;
	sourceQuestionOptions?: Array<{ value: string; label: string }>;
	sourceQuestionId?: string;
	onRequiredChange?: (required: boolean) => void;
	onUploadFileTypesChange?: (nextTypes: string[]) => void;
	onUploadMaxFileAmountChange?: (value: number) => void;
	onUploadMaxFileSizeLimitChange?: (value: number) => void;
	onDateOptionChange?: (field: "dateHasYear" | "dateHasMonth" | "dateHasDay" | "dateHasMinDate" | "dateHasMaxDate", checked: boolean) => void;
	onDateRangeChange?: (field: "dateMinDate" | "dateMaxDate", value: string) => void;
	onUrlChange?: (url: string) => void;
	onOauthProviderChange?: (provider: "GOOGLE" | "GITHUB") => void;
	onFold?: () => void;
	onTypeChange?: (nextType: Question["type"]) => void;
}

type typeInfo = {
	icon: React.ReactNode;
	label: string;
	optionType?: "radio" | "checkbox" | "list";
};

const typeMap: Record<Question["type"], typeInfo> = {
	SHORT_TEXT: {
		icon: <CaseSensitive />,
		label: "文字簡答"
	},
	LONG_TEXT: {
		icon: <TextAlignStart />,
		label: "文字詳答"
	},
	SINGLE_CHOICE: {
		icon: <List />,
		label: "單選選擇題",
		optionType: "radio"
	},
	MULTIPLE_CHOICE: {
		icon: <SquareCheckBig />,
		label: "核取方塊",
		optionType: "checkbox"
	},
	DROPDOWN: {
		icon: <Rows3 />,
		label: "下拉選單",
		optionType: "list"
	},
	DETAILED_MULTIPLE_CHOICE: {
		icon: <LayoutList />,
		label: "詳細核取方塊"
	},
	UPLOAD_FILE: {
		icon: <CloudUpload />,
		label: "檔案上傳"
	},
	LINEAR_SCALE: {
		icon: <Ellipsis />,
		label: "線性刻度"
	},
	RATING: {
		icon: <Star />,
		label: "評分"
	},
	RANKING: {
		icon: <ListOrdered />,
		label: "排序",
		optionType: "list"
	},
	DATE: {
		icon: <Calendar />,
		label: "日期選擇"
	},
	HYPERLINK: {
		icon: <Link2 />,
		label: "超連結"
	},
	OAUTH_CONNECT: {
		icon: <ShieldCheck />,
		label: "OAuth 驗證"
	}
};

const questionTypes = Object.keys(typeMap) as Question["type"][];
const uploadFileTypeCategoryMap: Record<string, FormsAllowedFileTypes[]> = {
	圖片: [
		FormsAllowedFileTypes.JPG,
		FormsAllowedFileTypes.JPEG,
		FormsAllowedFileTypes.PNG,
		FormsAllowedFileTypes.WEBP,
		FormsAllowedFileTypes.GIF,
		FormsAllowedFileTypes.TIFF,
		FormsAllowedFileTypes.BMP,
		FormsAllowedFileTypes.HEIC,
		FormsAllowedFileTypes.RAW,
		FormsAllowedFileTypes.SVG,
		FormsAllowedFileTypes.AI,
		FormsAllowedFileTypes.EPS
	],
	影片: [FormsAllowedFileTypes.MP4, FormsAllowedFileTypes.WEBM, FormsAllowedFileTypes.MOV, FormsAllowedFileTypes.MKV, FormsAllowedFileTypes.AVI],
	音訊: [FormsAllowedFileTypes.MP3, FormsAllowedFileTypes.WAV, FormsAllowedFileTypes.M4A, FormsAllowedFileTypes.AAC, FormsAllowedFileTypes.OGG, FormsAllowedFileTypes.FLAC],
	文件: [FormsAllowedFileTypes.TXT, FormsAllowedFileTypes.MD, FormsAllowedFileTypes.DOC, FormsAllowedFileTypes.DOCX, FormsAllowedFileTypes.ODT, FormsAllowedFileTypes.RTF, FormsAllowedFileTypes.PDF],
	簡報: [FormsAllowedFileTypes.PPT, FormsAllowedFileTypes.PPTX, FormsAllowedFileTypes.ODP],
	試算表: [FormsAllowedFileTypes.XLS, FormsAllowedFileTypes.XLSX, FormsAllowedFileTypes.ODS, FormsAllowedFileTypes.CSV],
	壓縮檔: [FormsAllowedFileTypes.ZIP]
};

export const QuestionCard = (props: QuestionCardProps): ReactNode => {
	const { question, removeQuestion, duplicateQuestion } = props;

	const [isExpanded, setIsExpanded] = useState(props.defaultExpanded ?? false);
	const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [localUploadMaxFileAmountStr, setLocalUploadMaxFileAmountStr] = useState(() => String(question.uploadMaxFileAmount ?? 1));
	const [localUploadMaxFileSizeMbStr, setLocalUploadMaxFileSizeMbStr] = useState(() => String(Number(((question.uploadMaxFileSizeLimit ?? 10485760) / 1024 / 1024).toFixed(2))));
	const [localTitle, setLocalTitle] = useState(question.title);
	const localTitleRef = useRef(question.title);
	localTitleRef.current = localTitle;
	const [localDesc, setLocalDesc] = useState(question.description);
	const localDescRef = useRef(question.description);
	localDescRef.current = localDesc;
	const cardRef = useRef<HTMLElement | null>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const runWithIndicator = async (action: () => void | Promise<void>, setPending: (pending: boolean) => void) => {
		setPending(true);
		const startedAt = Date.now();
		try {
			await Promise.resolve(action());
		} finally {
			const elapsedMs = Date.now() - startedAt;
			const minVisibleMs = 250;
			if (elapsedMs < minVisibleMs) {
				await new Promise(resolve => window.setTimeout(resolve, minVisibleMs - elapsedMs));
			}
			setPending(false);
		}
	};

	useEffect(() => {
		setLocalDesc(question.description);
	}, [question.description]);

	useEffect(() => {
		if (props.autoFocusTitle && isExpanded && titleRef.current) {
			titleRef.current.focus();
			titleRef.current.select();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isExpanded) return;

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Element;
			// Ignore clicks inside Radix UI portals (dropdowns, popovers, etc.)
			if (target.closest("[data-radix-popper-content-wrapper], [data-radix-select-content], [data-radix-dropdown-menu-content]")) return;
			if (!cardRef.current?.contains(target)) {
				// Force blur on any focused input inside the card so its onBlur fires
				// while the component is still mounted (mousedown precedes blur)
				if (document.activeElement instanceof HTMLElement && cardRef.current?.contains(document.activeElement)) {
					document.activeElement.blur();
				}
				// flush title & description via refs as a safety net
				props.onTitleChange?.(localTitleRef.current);
				props.onDescriptionChange?.(localDescRef.current);
				props.onFold?.();
				setIsExpanded(false);
				setIsTypeMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [isExpanded, props]);

	const handleDuplicateClick = () => {
		if (isDuplicating || isDeleting) return;
		void runWithIndicator(duplicateQuestion, setIsDuplicating);
	};

	const handleDeleteClick = () => {
		if (isDeleting || isDuplicating) return;
		void runWithIndicator(removeQuestion, setIsDeleting);
	};

	const uploadFileTypeValues = (question.uploadAllowedFileTypes ?? ["PDF"]) as FormsAllowedFileTypes[];
	const localUploadMaxFileAmountNum = Number(localUploadMaxFileAmountStr);
	const uploadMaxFileAmountError = isNaN(localUploadMaxFileAmountNum) || localUploadMaxFileAmountNum < 1 || localUploadMaxFileAmountNum > 10 ? "上傳數量需介於 1 到 10" : "";
	const localUploadMaxFileSizeMbNum = Number(localUploadMaxFileSizeMbStr);
	const uploadMaxFileSizeError = isNaN(localUploadMaxFileSizeMbNum) || localUploadMaxFileSizeMbNum <= 0 || localUploadMaxFileSizeMbNum > 10 ? "檔案大小需介於 0 到 10 MB" : "";
	const minDateError = question.dateHasMinDate && !question.dateMinDate ? "請填開始日期" : "";
	const maxDateError = question.dateHasMaxDate && !question.dateMaxDate ? "請填結束日期" : "";

	return (
		<section ref={cardRef} className={`${styles.card} ${isExpanded ? styles.expanded : ""}`} onClick={() => !isExpanded && setIsExpanded(true)}>
			{isExpanded ? (
				<div
					onClick={e => {
						e.stopPropagation();
					}}
					onKeyDown={e => {
						if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
							e.preventDefault();
							props.onTitleChange?.(localTitleRef.current);
							props.onDescriptionChange?.(localDescRef.current);
							props.onFold?.();
							setIsExpanded(false);
							setIsTypeMenuOpen(false);
						}
					}}
					className={styles.content}
				>
					<div className={styles.header}>
						<div className={styles.input}>
							<Input
								ref={titleRef}
								value={localTitle}
								onChange={e => setLocalTitle(e.target.value)}
								onBlur={() => props.onTitleChange?.(localTitle)}
								placeholder="問題標題"
								variant="flushed"
								themeColor="--comment"
								textSize="h2"
							/>
							<TextArea
								value={localDesc}
								onChange={e => setLocalDesc(e.target.value)}
								onBlur={() => props.onDescriptionChange?.(localDesc)}
								placeholder="這裡可以寫一段描述（支援 Markdown）"
								variant="flushed"
								themeColor="--comment"
								rows={1}
							/>
						</div>
						<div className={styles.typeWrapper}>
							<Button variant="secondary" className={styles.typeButton} onClick={() => setIsTypeMenuOpen(prev => !prev)}>
								{typeMap[question.type].icon} {typeMap[question.type].label}
							</Button>
							{isTypeMenuOpen && (
								<div className={styles.typeMenu}>
									{questionTypes.map(type => (
										<button
											key={type}
											type="button"
											className={styles.typeMenuItem}
											onClick={() => {
												props.onTypeChange?.(type);
												setIsTypeMenuOpen(false);
											}}
										>
											{typeMap[type].icon}
											<span>{typeMap[type].label}</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
					{["SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "DROPDOWN"].some(type => type === question.type) && (
						<OptionsQuestion
							type={typeMap[question.type].optionType || "radio"}
							options={question.options || []}
							isFromAnswer={question.isFromAnswer}
							sourceOptions={props.sourceQuestionOptions ?? []}
							sourceValue={question.sourceQuestionId}
							onSourceChange={sourceId => props.onSourceQuestionChange?.(sourceId)}
							onAdd={() => {
								if (props.onAddOption) {
									props.onAddOption();
								}
							}}
							onAddOther={() => {
								if (props.onAddOtherOption) {
									props.onAddOtherOption();
								}
							}}
							onChange={(optionIndex, newLabel) => {
								if (props.onChangeOption) {
									props.onChangeOption(optionIndex, newLabel);
								}
							}}
							onRemove={optionIndex => {
								if (props.onRemoveOption) {
									props.onRemoveOption(optionIndex);
								}
							}}
							onRemoveOther={() => {
								if (props.onRemoveOtherOption) {
									props.onRemoveOtherOption();
								}
							}}
							onToggleIsFromAnswer={() => {
								if (props.onToggleIsFromAnswer) {
									props.onToggleIsFromAnswer();
								}
							}}
						/>
					)}
					{question.type === "LINEAR_SCALE" && (
						<div className={styles.linearScale}>
							<RangeQuestion
								start={question.start || 1}
								end={question.end || 5}
								startLabel={question.startLabel}
								endLabel={question.endLabel}
								hasIcon={false}
								onStartChange={props.onStartChange}
								onEndChange={props.onEndChange}
								onStartLabelChange={props.onStartLabelChange}
								onEndLabelChange={props.onEndLabelChange}
							/>
						</div>
					)}

					{question.type === "RATING" && (
						<div className={styles.linearScale}>
							<RangeQuestion
								start={question.start || 1}
								end={question.end || 5}
								startLabel={question.startLabel}
								endLabel={question.endLabel}
								hasIcon={true}
								icon={question.icon}
								onStartChange={props.onStartChange}
								onEndChange={props.onEndChange}
								onStartLabelChange={props.onStartLabelChange}
								onEndLabelChange={props.onEndLabelChange}
								onChangeIcon={props.onChangeIcon}
							/>
						</div>
					)}

					{question.type === "DETAILED_MULTIPLE_CHOICE" && (
						<DetailOptionsQuestion options={question.detailOptions || []} onAdd={props.onAddDetailOption || (() => {})} onEdit={props.onDetailOptionChange} onRemove={props.onRemoveDetailOption} />
					)}
					{question.type === "UPLOAD_FILE" && (
						<div className={styles.configSection}>
							<p className={styles.sectionTitle}>檔案類型</p>
							<div className={styles.checkboxGrid}>
								{Object.entries(uploadFileTypeCategoryMap).map(([categoryLabel, fileTypes]) => {
									const checked = fileTypes.every(fileType => uploadFileTypeValues.includes(fileType));
									return (
										<Checkbox
											key={categoryLabel}
											id={`${question.title}-${categoryLabel}`}
											label={categoryLabel}
											checked={checked}
											onCheckedChange={checked => {
												const checkedBoolean = Boolean(checked);
												const next = checkedBoolean ? Array.from(new Set([...uploadFileTypeValues, ...fileTypes])) : uploadFileTypeValues.filter(value => !fileTypes.includes(value));
												props.onUploadFileTypesChange?.(next);
											}}
										/>
									);
								})}
							</div>
							<div className={styles.numberConfigRow}>
								<Input
									type="number"
									label="上傳數量"
									min={1}
									max={10}
									value={localUploadMaxFileAmountStr}
									error={uploadMaxFileAmountError}
									onChange={event => setLocalUploadMaxFileAmountStr(event.target.value)}
									onBlur={() => {
										const num = Number(localUploadMaxFileAmountStr);
										if (!isNaN(num)) props.onUploadMaxFileAmountChange?.(num);
									}}
								/>
								<Input
									type="number"
									label="大小上限（MB）"
									min={0.01}
									max={10}
									step={0.01}
									value={localUploadMaxFileSizeMbStr}
									error={uploadMaxFileSizeError}
									onChange={event => setLocalUploadMaxFileSizeMbStr(event.target.value)}
									onBlur={() => {
										const num = Number(localUploadMaxFileSizeMbStr);
										if (!isNaN(num)) props.onUploadMaxFileSizeLimitChange?.(Math.round(num * 1024 * 1024));
									}}
								/>
							</div>
						</div>
					)}
					{question.type === "DATE" && (
						<div className={styles.configSection}>
							<p className={styles.sectionTitle}>日期選項</p>
							<div className={styles.checkboxRow}>
								<Checkbox
									id={`${question.title}-hasYear`}
									label="詢問年"
									checked={question.dateHasYear ?? true}
									onCheckedChange={checked => props.onDateOptionChange?.("dateHasYear", Boolean(checked))}
								/>
								<Checkbox
									id={`${question.title}-hasMonth`}
									label="詢問月"
									checked={question.dateHasMonth ?? true}
									onCheckedChange={checked => props.onDateOptionChange?.("dateHasMonth", Boolean(checked))}
								/>
								<Checkbox
									id={`${question.title}-hasDay`}
									label="詢問日"
									checked={question.dateHasDay ?? true}
									onCheckedChange={checked => props.onDateOptionChange?.("dateHasDay", Boolean(checked))}
								/>
							</div>
							<div className={styles.checkboxRow}>
								<Checkbox
									id={`${question.title}-hasMinDate`}
									label="是否限制開始"
									checked={question.dateHasMinDate ?? false}
									onCheckedChange={checked => props.onDateOptionChange?.("dateHasMinDate", Boolean(checked))}
								/>
								<Checkbox
									id={`${question.title}-hasMaxDate`}
									label="是否限制結束"
									checked={question.dateHasMaxDate ?? false}
									onCheckedChange={checked => props.onDateOptionChange?.("dateHasMaxDate", Boolean(checked))}
								/>
							</div>
							<div className={styles.numberConfigRow}>
								<Input
									type="date"
									label="開始日期"
									value={question.dateMinDate ?? ""}
									error={minDateError}
									disabled={!(question.dateHasMinDate ?? false)}
									onChange={event => props.onDateRangeChange?.("dateMinDate", event.target.value)}
								/>
								<Input
									type="date"
									label="結束日期"
									value={question.dateMaxDate ?? ""}
									error={maxDateError}
									disabled={!(question.dateHasMaxDate ?? false)}
									onChange={event => props.onDateRangeChange?.("dateMaxDate", event.target.value)}
								/>
							</div>
						</div>
					)}
					{question.type === "HYPERLINK" && <p className={styles.hintText}>此題型會讓填答者輸入 URL，僅需設定標題與描述。</p>}
					{question.type === "OAUTH_CONNECT" && (
						<div className={styles.configSection}>
							<Select
								label="綁定平台"
								value={question.oauthProvider ?? "GITHUB"}
								onValueChange={value => props.onOauthProviderChange?.(value as "GOOGLE" | "GITHUB")}
								options={[
									{ label: "GitHub", value: "GITHUB", icon: <Github size={16} /> },
									{ label: "Google", value: "GOOGLE", icon: <Chrome size={16} /> }
								]}
							/>
						</div>
					)}
					<div className={styles.actions}>
						<button
							type="button"
							className={`${styles.iconButton} ${isDuplicating ? styles.processing : ""}`}
							onClick={handleDuplicateClick}
							disabled={isDuplicating || isDeleting}
							aria-label={isDuplicating ? "複製中" : "複製問題"}
						>
							<Copy />
						</button>
						<button
							type="button"
							className={`${styles.iconButton} ${isDeleting ? styles.processing : ""}`}
							onClick={handleDeleteClick}
							disabled={isDeleting || isDuplicating}
							aria-label={isDeleting ? "刪除中" : "刪除問題"}
						>
							<Trash2 />
						</button>
						<div className={`${styles.switch}`}>
							<p className={`${styles.label}`}>必填</p>
							<Switch checked={question.required ?? false} onClick={() => props.onRequiredChange?.(!(question.required ?? false))} />
						</div>
					</div>
				</div>
			) : (
				<div className={styles.preview}>
					{typeMap[question.type].icon}
					<p>
						{props.questionNumber !== undefined ? `Q${props.questionNumber}. ` : ""}
						{props.question.title || "問題標題"}
					</p>
				</div>
			)}
		</section>
	);
};
