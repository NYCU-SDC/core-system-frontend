import * as api from "@/features/form/services/api";
import type { TableColumn } from "@/shared/components";
import { Button, Dialog, Table, useToast } from "@/shared/components";
import type { FormsListSectionsResponse, ResponsesExportPreviewResponse } from "@nycu-sdc/core-system-sdk";
import { Check, Download, FileText, Minus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./ExportDialog.module.css";

type ExportPopupStep = "select" | "preview";
type ExportPreviewRow = Record<string, string>;

interface ExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	formId: string;
	formName: string;
	sectionsData: FormsListSectionsResponse[] | undefined;
}

const formatExportAnswer = (value: unknown): string => {
	if (value == null) return "-";
	if (typeof value === "string") return value || "-";
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) {
		const items = value.map(item => formatExportAnswer(item)).filter(item => item !== "-");
		return items.length > 0 ? items.join(", ") : "-";
	}
	if (typeof value === "object") {
		const record = value as Record<string, unknown>;
		if (typeof record.displayValue === "string" && record.displayValue.trim()) return record.displayValue;
		if (typeof record.otherText === "string" && record.otherText.trim()) return record.otherText;
		if (typeof record.value === "string" || typeof record.value === "number" || typeof record.value === "boolean") {
			return String(record.value);
		}
		if (Array.isArray(record.value)) {
			const items = record.value.map(item => formatExportAnswer(item)).filter(item => item !== "-");
			return items.length > 0 ? items.join(", ") : "-";
		}
		return JSON.stringify(value);
	}

	return String(value);
};

export const ExportDialog = ({ open, onOpenChange, formId, formName, sectionsData }: ExportDialogProps) => {
	const { pushToast } = useToast();
	const [exportPopupStep, setExportPopupStep] = useState<ExportPopupStep>("select");
	const [selectedExportQuestionIds, setSelectedExportQuestionIds] = useState<string[]>([]);
	const [exportPreview, setExportPreview] = useState<ResponsesExportPreviewResponse | null>(null);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isDownloadLoading, setIsDownloadLoading] = useState(false);

	const exportSections = useMemo(() => {
		const flatSections = sectionsData?.flatMap(group => group.sections) ?? [];
		let qIndex = 0;
		return flatSections.map(section => ({
			id: section.id,
			title: section.title ?? "",
			questions: (section.questions ?? []).map(question => ({
				id: question.id,
				label: `Q${++qIndex} ${question.title}`,
				question
			}))
		}));
	}, [sectionsData]);

	const exportQuestions = useMemo(() => exportSections.flatMap(section => section.questions), [exportSections]);
	const effectiveSelectedExportQuestionIds = selectedExportQuestionIds.length > 0 ? selectedExportQuestionIds : exportQuestions.map(item => item.id);
	const isAllExportQuestionsSelected = exportQuestions.length > 0 && effectiveSelectedExportQuestionIds.length === exportQuestions.length;

	const sectionCheckStates = useMemo(() => {
		const map = new Map<string, "all" | "partial" | "none">();
		for (const section of exportSections) {
			const ids = section.questions.map(question => question.id);
			if (ids.length === 0) {
				map.set(section.id, "none");
				continue;
			}

			const selectedCount = ids.filter(id => effectiveSelectedExportQuestionIds.includes(id)).length;
			if (selectedCount === 0) map.set(section.id, "none");
			else if (selectedCount === ids.length) map.set(section.id, "all");
			else map.set(section.id, "partial");
		}
		return map;
	}, [exportSections, effectiveSelectedExportQuestionIds]);

	const exportTableColumns: TableColumn<ExportPreviewRow>[] = useMemo(() => {
		if (!exportPreview) return [];

		return [
			{
				key: "responseId",
				header: "回覆 ID",
				minWidth: "12rem"
			},
			...exportPreview.headers.map(header => ({
				key: header.id,
				header: header.title,
				minWidth: "10rem"
			}))
		];
	}, [exportPreview]);

	const exportPreviewRows = useMemo<ExportPreviewRow[]>(() => {
		if (!exportPreview) return [];

		return exportPreview.rows.map(row => {
			const record: ExportPreviewRow = {
				responseId: row.id
			};

			for (const header of exportPreview.headers) {
				record[header.id] = formatExportAnswer(row.answers?.[header.id]);
			}

			return record;
		});
	}, [exportPreview]);

	useEffect(() => {
		if (!open) return;
		setExportPopupStep("select");
		setSelectedExportQuestionIds([]);
		setExportPreview(null);
		setIsPreviewLoading(false);
		setIsDownloadLoading(false);
	}, [open]);

	const handleToggleAllExportQuestions = () => {
		if (isAllExportQuestionsSelected) {
			setSelectedExportQuestionIds([]);
			return;
		}
		setSelectedExportQuestionIds(exportQuestions.map(item => item.id));
	};

	const handleToggleExportSection = (sectionId: string) => {
		const section = exportSections.find(item => item.id === sectionId);
		if (!section) return;

		const ids = section.questions.map(question => question.id);
		const state = sectionCheckStates.get(sectionId);

		setSelectedExportQuestionIds(prev => {
			const base = prev.length > 0 ? prev : exportQuestions.map(question => question.id);
			if (state === "all") return base.filter(id => !ids.includes(id));
			return [...new Set([...base, ...ids])];
		});
	};

	const handleToggleExportQuestion = (questionId: string) => {
		setSelectedExportQuestionIds(prev => {
			const base = prev.length > 0 ? prev : exportQuestions.map(item => item.id);
			if (base.includes(questionId)) return base.filter(id => id !== questionId);
			return [...base, questionId];
		});
	};

	const handlePreviewExport = async () => {
		if (effectiveSelectedExportQuestionIds.length === 0) {
			pushToast({ title: "請至少選擇一個匯出欄位", variant: "warning" });
			return;
		}

		try {
			setIsPreviewLoading(true);
			const preview = await api.previewFormResponseExport(formId, {
				questionIds: effectiveSelectedExportQuestionIds
			});
			setExportPreview(preview);
			setExportPopupStep("preview");
		} catch (error) {
			pushToast({
				title: "預覽匯出失敗",
				description: (error as Error).message,
				variant: "error"
			});
		} finally {
			setIsPreviewLoading(false);
		}
	};

	const handleDownloadExportFile = async () => {
		if (effectiveSelectedExportQuestionIds.length === 0) {
			pushToast({ title: "請至少選擇一個匯出欄位", variant: "warning" });
			return;
		}

		try {
			setIsDownloadLoading(true);
			const { blob, filename } = await api.exportFormResponses(formId, effectiveSelectedExportQuestionIds);
			const downloadUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename || `${formName}.xlsx`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			pushToast({
				title: "匯出下載失敗",
				description: (error as Error).message,
				variant: "error"
			});
		} finally {
			setIsDownloadLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} title="匯出回覆資料" size="xl">
			<div className={styles.exportPopup}>
				<h2 className={styles.exportTitle}>{formName}.xlsx</h2>

				{exportPopupStep === "select" && (
					<>
						<p className={styles.exportHint}>請選擇要匯出的題目欄位</p>

						<div className={styles.exportQuestionBox}>
							<label className={styles.exportQuestionItem}>
								<input type="checkbox" checked={isAllExportQuestionsSelected} onChange={handleToggleAllExportQuestions} />
								<span className={styles.exportCheckboxIcon}>{isAllExportQuestionsSelected && <Check size={18} />}</span>
								<span>全部</span>
							</label>

							{exportSections.map(section => {
								const state = sectionCheckStates.get(section.id) ?? "none";
								return (
									<div key={section.id} className={styles.exportSectionGroup}>
										<label className={styles.exportSectionItem}>
											<input
												type="checkbox"
												ref={element => {
													if (element) element.indeterminate = state === "partial";
												}}
												checked={state === "all"}
												onChange={() => handleToggleExportSection(section.id)}
											/>
											<span className={styles.exportCheckboxIcon}>
												{state === "all" && <Check size={18} />}
												{state === "partial" && <Minus size={18} />}
											</span>
											<span>{section.title || "未命名區段"}</span>
										</label>

										{section.questions.map(item => {
											const checked = effectiveSelectedExportQuestionIds.includes(item.id);
											return (
												<label key={item.id} className={`${styles.exportQuestionItem} ${styles.exportQuestionItemIndented}`}>
													<input type="checkbox" checked={checked} onChange={() => handleToggleExportQuestion(item.id)} />
													<span className={styles.exportCheckboxIcon}>{checked && <Check size={18} />}</span>
													<span>{item.label}</span>
												</label>
											);
										})}
									</div>
								);
							})}
						</div>

						<div className={styles.exportPopupActions}>
							<Button className={`${styles.buttonOrange} ${styles.exportPrimaryButton}`} onClick={handlePreviewExport} disabled={isPreviewLoading || isDownloadLoading}>
								<FileText size={20} />
								{isPreviewLoading ? "預覽中..." : "預覽匯出內容"}
							</Button>
							<Button className={`${styles.buttonForeground} ${styles.exportDownloadButton}`} onClick={handleDownloadExportFile} disabled={isPreviewLoading || isDownloadLoading}>
								<Download size={20} />
								{isDownloadLoading ? "下載中..." : "直接下載"}
							</Button>
						</div>
					</>
				)}

				{exportPopupStep === "preview" && (
					<>
						<Table
							columns={exportTableColumns}
							data={exportPreviewRows}
							borderStyle="full"
							containerClassName={styles.exportPreviewTableContainer}
							showRowNumber
							emptyMessage="目前沒有可預覽的匯出資料"
						/>

						<div className={styles.exportPopupActions}>
							<Button className={`${styles.buttonOrange} ${styles.exportPrimaryButton}`} onClick={() => setExportPopupStep("select")} disabled={isDownloadLoading}>
								<RotateCcw size={20} />
								返回重新選擇
							</Button>
							<Button className={`${styles.buttonForeground} ${styles.exportDownloadButton}`} variant="secondary" onClick={handleDownloadExportFile} disabled={isDownloadLoading}>
								<Download size={20} />
								{isDownloadLoading ? "下載中..." : "下載 .xlsx"}
							</Button>
						</div>
					</>
				)}
			</div>
		</Dialog>
	);
};
