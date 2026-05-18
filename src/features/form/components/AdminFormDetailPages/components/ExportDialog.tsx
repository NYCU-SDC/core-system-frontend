import type { TableColumn } from "@/shared/components";
import { Button, Table, Dialog, useToast } from "@/shared/components";
import type { FormsListSectionsResponse, ResponsesAnswersDetail, ResponsesGetFormResponse, ResponsesListResponse } from "@nycu-sdc/core-system-sdk";
import { Check, Download, FileText, Minus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./ExportDialog.module.css";

type ExportPopupStep = "select" | "preview";

interface ExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sectionsData: FormsListSectionsResponse[] | undefined;
	responses: ResponsesListResponse["responses"];
	responseDetailsMap: Map<string, ResponsesGetFormResponse>;
	memberDisplayById: Map<string, string>;
}

const getAnswerDisplayValue = (detail?: ResponsesAnswersDetail): string => {
	if (!detail) return "";
	if (detail.payload?.displayValue) return detail.payload.displayValue;

	const rawAnswer = detail.payload?.answer as { value?: unknown; otherText?: string } | undefined;
	if (!rawAnswer) return "";

	if (Array.isArray(rawAnswer.value)) {
		const values = rawAnswer.value.map(value => String(value));
		if (rawAnswer.otherText?.trim()) values.push(`其他：${rawAnswer.otherText.trim()}`);
		return values.join("、");
	}

	if (typeof rawAnswer.value === "string" || typeof rawAnswer.value === "number") {
		return String(rawAnswer.value);
	}

	if (rawAnswer.value && typeof rawAnswer.value === "object") {
		const objectValue = rawAnswer.value as { username?: string; email?: string };
		return objectValue.username || objectValue.email || "";
	}

	return "";
};

export const ExportDialog = ({ open, onOpenChange, sectionsData, responses, responseDetailsMap, memberDisplayById }: ExportDialogProps) => {
	const { pushToast } = useToast();
	const [exportPopupStep, setExportPopupStep] = useState<ExportPopupStep>("select");
	const [selectedExportQuestionIds, setSelectedExportQuestionIds] = useState<string[]>([]);

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

	const exportQuestions = useMemo(() => exportSections.flatMap(s => s.questions), [exportSections]);

	const effectiveSelectedExportQuestionIds = selectedExportQuestionIds.length > 0 ? selectedExportQuestionIds : exportQuestions.map(item => item.id);

	const isAllExportQuestionsSelected = exportQuestions.length > 0 && effectiveSelectedExportQuestionIds.length === exportQuestions.length;

	const sectionCheckStates = useMemo(() => {
		const map = new Map<string, "all" | "partial" | "none">();
		for (const section of exportSections) {
			const ids = section.questions.map(q => q.id);
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

	const selectedExportQuestions = useMemo(() => {
		const selectedSet = new Set(effectiveSelectedExportQuestionIds);
		return exportQuestions.filter(item => selectedSet.has(item.id));
	}, [effectiveSelectedExportQuestionIds, exportQuestions]);

	useEffect(() => {
		if (!open) return;
		setExportPopupStep("select");
		setSelectedExportQuestionIds([]);
	}, [open]);

	const exportTableColumns: TableColumn[] = useMemo(
		() => [
			{ key: "responseLabel", header: "回覆", width: "fixed" as const, fixedWidth: "6rem" },
			{ key: "createdAt", header: "提交時間", width: "fixed" as const, fixedWidth: "10rem" },
			{ key: "submittedBy", header: "填答者", width: "fixed" as const, fixedWidth: "8rem" },
			...selectedExportQuestions.map(item => ({
				key: item.id,
				header: item.label,
				minWidth: "8rem",
				render: (_value: unknown, record: unknown) => {
					const typedRecord = record as Record<string, unknown>;
					const answers = typedRecord.answers as string[];
					const answerIndex = selectedExportQuestions.findIndex(q => q.id === item.id);
					return answers?.[answerIndex] || "-";
				}
			}))
		],
		[selectedExportQuestions]
	);

	const exportPreviewRows = useMemo(() => {
		return responses.map((response, index) => {
			const responseDetail = responseDetailsMap.get(response.id);
			const answerMap = new Map<string, ResponsesAnswersDetail>();

			for (const section of responseDetail?.sections ?? []) {
				for (const answerDetail of section.answerDetails ?? []) {
					answerMap.set(answerDetail.question.id, answerDetail);
				}
			}

			return {
				id: response.id,
				responseLabel: `回覆 ${index + 1}`,
				createdAt: new Date(response.createdAt).toLocaleString("zh-TW"),
				submittedBy: memberDisplayById.get(response.submittedBy) ?? response.submittedBy,
				answers: selectedExportQuestions.map(item => getAnswerDisplayValue(answerMap.get(item.id)))
			};
		});
	}, [memberDisplayById, responseDetailsMap, responses, selectedExportQuestions]);

	const mockExportPreviewRows = useMemo(() => {
		const mockSubmitters = ["毛宥鈞", "毛哥", "EM"];
		return mockSubmitters.map((name, index) => ({
			id: `mock-${index + 1}`,
			responseLabel: `回覆 ${index + 1}`,
			createdAt: new Date(2025, 4, 12, 10 + index * 2).toLocaleString("zh-TW"),
			submittedBy: name,
			answers: selectedExportQuestions.map((_, qi) => `樣本答案 ${qi + 1}`)
		}));
	}, [selectedExportQuestions]);

	const handleToggleAllExportQuestions = () => {
		if (isAllExportQuestionsSelected) {
			setSelectedExportQuestionIds([]);
			return;
		}
		setSelectedExportQuestionIds(exportQuestions.map(item => item.id));
	};

	const handleToggleExportSection = (sectionId: string) => {
		const section = exportSections.find(s => s.id === sectionId);
		if (!section) return;
		const ids = section.questions.map(q => q.id);
		const state = sectionCheckStates.get(sectionId);
		setSelectedExportQuestionIds(prev => {
			const base = prev.length > 0 ? prev : exportQuestions.map(q => q.id);
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

	const handlePreviewExport = () => {
		if (effectiveSelectedExportQuestionIds.length === 0) {
			pushToast({ title: "請至少選擇一個匯出欄位", variant: "warning" });
			return;
		}
		setExportPopupStep("preview");
	};

	const handleDownloadExportFile = () => {
		// TODO: 串接後端 .xlsx 匯出 API，或在前端接 xlsx / exceljs 產檔。
		pushToast({
			title: "尚未串接下載功能",
			description: "請在 handleDownloadExportFile 中接上 .xlsx 產生邏輯。",
			variant: "warning"
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} title="匯出回覆資料" size="xl">
			<div className={styles.exportPopup}>
				<h2 className={styles.exportTitle}>匯出 .xlsx</h2>

				{exportPopupStep === "select" && (
					<>
						<p className={styles.exportHint}>請選擇欲匯出的題目：</p>

						<div className={styles.exportQuestionBox}>
							<label className={styles.exportQuestionItem}>
								<input type="checkbox" checked={isAllExportQuestionsSelected} onChange={handleToggleAllExportQuestions} />
								<span className={styles.exportCheckboxIcon}>{isAllExportQuestionsSelected && <Check size={18} />}</span>
								<span>全選</span>
							</label>

							{exportSections.map(section => {
								const state = sectionCheckStates.get(section.id) ?? "none";
								return (
									<div key={section.id} className={styles.exportSectionGroup}>
										<label className={styles.exportSectionItem}>
											<input
												type="checkbox"
												ref={el => {
													if (el) el.indeterminate = state === "partial";
												}}
												checked={state === "all"}
												onChange={() => handleToggleExportSection(section.id)}
											/>
											<span className={styles.exportCheckboxIcon}>
												{state === "all" && <Check size={18} />}
												{state === "partial" && <Minus size={18} />}
											</span>
											<span>{section.title || "未命名區塊"}</span>
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
							<Button className={`${styles.buttonOrange} ${styles.exportPrimaryButton}`} onClick={handlePreviewExport}>
								<FileText size={20} />
								預覽匯出格式
							</Button>
							<Button className={`${styles.buttonForeground} ${styles.exportDownloadButton}`} onClick={handleDownloadExportFile}>
								<Download size={20} />
								下載檔案
							</Button>
						</div>
					</>
				)}

				{exportPopupStep === "preview" && (
					<>
						<Table
							columns={exportTableColumns}
							data={exportPreviewRows.length > 0 ? exportPreviewRows : mockExportPreviewRows}
							borderStyle="full"
							containerClassName={styles.exportPreviewTableContainer}
							showRowNumber
						/>

						<div className={styles.exportPopupActions}>
							<Button className={`${styles.buttonOrange} ${styles.exportPrimaryButton}`} onClick={() => setExportPopupStep("select")}>
								<RotateCcw size={20} />
								修改選擇欄位
							</Button>
							<Button className={`${styles.buttonForeground} ${styles.exportDownloadButton}`} variant="secondary" onClick={handleDownloadExportFile}>
								<Download size={20} />
								下載檔案
							</Button>
						</div>
					</>
				)}
			</div>
		</Dialog>
	);
};
