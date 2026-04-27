import { useActiveOrgSlug, useOrgMembers } from "@/features/dashboard/hooks/useOrgSettings";
import { useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useGoogleSheetEmail, useUpdateForm, useVerifyGoogleSheet } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import * as api from "@/features/form/services/api";
import { Button, Dialog, ErrorMessage, LoadingSpinner, Markdown, Select, useToast } from "@/shared/components";
import type { FormsForm, FormsQuestionResponse, ResponsesAnswersDetail, ResponsesGetFormResponse } from "@nycu-sdc/core-system-sdk";
import { useQueries } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { ChevronLeft, ChevronRight, Copy, Repeat2, SquareArrowOutUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { FormQuestionRenderer } from "../FormQuestionRenderer";
import { StatusTag } from "../StatusTag";
import styles from "./RepliesPage.module.css";

type RepliesMode = "summary" | "individual";

const CHOICE_TYPES = new Set(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"]);
const SCALE_TYPES = new Set(["LINEAR_SCALE", "RATING"]);

type SummaryDataItem = {
	name: string;
	value: number;
};

const getCssVarColor = (tokenName: string, fallback: string) => {
	if (typeof window === "undefined") return fallback;
	const value = window.getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
	return value || fallback;
};

const getChartSidePadding = (itemCount: number): string | number => {
	if (itemCount <= 1) return "42%";
	if (itemCount === 2) return "34%";
	if (itemCount === 3) return "26%";
	if (itemCount === 4) return "18%";
	return 8;
};

const buildBarChartOption = (items: SummaryDataItem[], barColor: string, textColor: string): EChartsOption => {
	const sidePadding = getChartSidePadding(items.length);

	return {
		tooltip: {
			trigger: "axis",
			axisPointer: { type: "shadow" }
		},
		grid: {
			left: sidePadding,
			right: sidePadding,
			top: 8,
			bottom: 32,
			containLabel: true
		},
		xAxis: {
			type: "category",
			data: items.map(item => item.name),
			axisTick: {
				alignWithLabel: true
			},
			axisLabel: {
				color: textColor,
				interval: 0,
				hideOverlap: true
			}
		},
		yAxis: {
			type: "value",
			minInterval: 1,
			axisLabel: {
				color: textColor
			}
		},
		series: [
			{
				type: "bar",
				data: items.map(item => item.value),
				barMaxWidth: 36,
				itemStyle: {
					color: barColor
				},
				label: {
					show: true,
					position: "top",
					color: textColor
				}
			}
		]
	};
};

const buildPieChartOption = (items: SummaryDataItem[], pieColors: string[], textColor: string): EChartsOption => {
	const nonZeroItems = items.filter(item => item.value > 0);
	const data = nonZeroItems.length > 0 ? nonZeroItems : items;

	return {
		color: pieColors,
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			bottom: 0,
			left: "center",
			textStyle: {
				color: textColor
			}
		},
		series: [
			{
				type: "pie",
				radius: ["40%", "68%"],
				center: ["50%", "42%"],
				avoidLabelOverlap: true,
				label: {
					show: true,
					formatter: "{c}",
					color: textColor
				},
				emphasis: {
					label: {
						show: true,
						fontWeight: 700,
						color: textColor
					}
				},
				labelLine: {
					show: true
				},
				data
			}
		]
	};
};

const toAnswerValues = (answerDetail: ResponsesAnswersDetail): string[] => {
	const rawAnswer = answerDetail.payload?.answer as { value?: unknown; otherText?: string } | undefined;
	if (!rawAnswer) return [];

	if (Array.isArray(rawAnswer.value)) {
		const values = rawAnswer.value.map(value => String(value));
		if (rawAnswer.otherText?.trim()) {
			values.push(`其他：${rawAnswer.otherText.trim()}`);
		}
		return values;
	}

	if (typeof rawAnswer.value === "string" || typeof rawAnswer.value === "number") {
		return [String(rawAnswer.value)];
	}

	if (answerDetail.payload?.displayValue) {
		return [answerDetail.payload.displayValue];
	}

	return [];
};

const renderSummaryVisualization = (question: FormsQuestionResponse, details: ResponsesAnswersDetail[], barColor: string, pieColors: string[], textColor: string) => {
	if (details.length === 0) {
		return <p className={styles.emptyState}>尚無可統計的回答。</p>;
	}

	if (CHOICE_TYPES.has(question.type)) {
		const choiceMap = new Map((question.choices ?? []).map(choice => [choice.id, choice.name]));
		const countMap = new Map<string, number>();

		for (const detail of details) {
			for (const value of toAnswerValues(detail)) {
				const display = choiceMap.get(value) ?? value;
				countMap.set(display, (countMap.get(display) ?? 0) + 1);
			}
		}

		for (const choice of question.choices ?? []) {
			if (!countMap.has(choice.name)) {
				countMap.set(choice.name, 0);
			}
		}

		const data = [...countMap.entries()].map(([name, value]) => ({ name, value }));
		if (question.type === "SINGLE_CHOICE") {
			return <ReactECharts className={styles.chart} option={buildPieChartOption(data, pieColors, textColor)} notMerge lazyUpdate />;
		}

		return <ReactECharts className={styles.chart} option={buildBarChartOption(data, barColor, textColor)} notMerge lazyUpdate />;
	}

	if (SCALE_TYPES.has(question.type)) {
		const min = question.scale?.minVal ?? 1;
		const max = question.scale?.maxVal ?? 5;
		const countMap = new Map<number, number>();
		for (let value = min; value <= max; value += 1) {
			countMap.set(value, 0);
		}

		for (const detail of details) {
			for (const rawValue of toAnswerValues(detail)) {
				const parsed = Number(rawValue);
				if (!Number.isNaN(parsed) && countMap.has(parsed)) {
					countMap.set(parsed, (countMap.get(parsed) ?? 0) + 1);
				}
			}
		}

		const data = [...countMap.entries()].map(([key, value]) => ({ name: String(key), value }));
		return <ReactECharts className={styles.chart} option={buildBarChartOption(data, barColor, textColor)} notMerge lazyUpdate />;
	}

	const textAnswers = details.map(detail => detail.payload?.displayValue?.trim() ?? "").filter(answer => answer.length > 0);

	if (textAnswers.length === 0) {
		return <p className={styles.emptyState}>尚無可統計的回答。</p>;
	}

	return (
		<div className={styles.textSummaryList}>
			{textAnswers.map((answer, index) => (
				<div key={`${answer}-${index}`} className={styles.textSummaryItem}>
					{answer}
				</div>
			))}
		</div>
	);
};

interface AdminFormRepliesPageProps {
	formData: FormsForm;
}

export const AdminFormRepliesPage = ({ formData }: AdminFormRepliesPageProps) => {
	const { pushToast } = useToast();
	const [mode, setMode] = useState<RepliesMode>("summary");
	const [selectedResponseId, setSelectedResponseId] = useState<string>("");
	const [isSheetPopupOpen, setIsSheetPopupOpen] = useState(false);
	const [sheetUrl, setSheetUrl] = useState(formData.googleSheetUrl ?? "");
	const [isSheetLinked, setIsSheetLinked] = useState(Boolean(formData.googleSheetUrl));
	const [prevGoogleSheetUrl, setPrevGoogleSheetUrl] = useState(formData.googleSheetUrl);
	const orgSlug = useActiveOrgSlug();

	const responsesQuery = useFormResponses(formData.id);
	const sectionsQuery = useSections(formData.id);
	const membersQuery = useOrgMembers(orgSlug, !!orgSlug);
	const emailQuery = useGoogleSheetEmail();
	const verifyMutation = useVerifyGoogleSheet(formData.id);
	const updateFormMutation = useUpdateForm(formData.id);

	if (formData.googleSheetUrl !== prevGoogleSheetUrl) {
		setSheetUrl(formData.googleSheetUrl ?? "");
		setIsSheetLinked(Boolean(formData.googleSheetUrl));
		setPrevGoogleSheetUrl(formData.googleSheetUrl);
	}

	const responses = useMemo(() => responsesQuery.data?.responses ?? [], [responsesQuery.data?.responses]);
	const allQuestions = useMemo(() => {
		const sections = sectionsQuery.data?.flatMap(group => group.sections) ?? [];
		return sections.flatMap(section => section.questions ?? []);
	}, [sectionsQuery.data]);

	const responseDetailQueries = useQueries({
		queries: responses.map(response => ({
			queryKey: ["form-response-detail", formData.id, response.id],
			queryFn: () => api.getFormResponse(formData.id, response.id),
			enabled: responses.length > 0
		}))
	});

	const detailsLoading = responseDetailQueries.some(query => query.isLoading || query.isFetching);
	const detailsError = responseDetailQueries.find(query => query.isError)?.error as Error | undefined;

	const responseDetailsMap = useMemo(() => {
		const next = new Map<string, ResponsesGetFormResponse>();
		responseDetailQueries.forEach((query, index) => {
			const response = responses[index];
			if (response && query.data) {
				next.set(response.id, query.data as ResponsesGetFormResponse);
			}
		});
		return next;
	}, [responseDetailQueries, responses]);

	const answerDetailsByQuestionId = useMemo(() => {
		const next = new Map<string, ResponsesAnswersDetail[]>();
		for (const detail of responseDetailsMap.values()) {
			for (const section of detail.sections) {
				for (const answerDetail of section.answerDetails ?? []) {
					if (!next.has(answerDetail.question.id)) {
						next.set(answerDetail.question.id, []);
					}
					next.get(answerDetail.question.id)?.push(answerDetail);
				}
			}
		}
		return next;
	}, [responseDetailsMap]);

	const effectiveSelectedResponseId = selectedResponseId && responses.some(response => response.id === selectedResponseId) ? selectedResponseId : (responses[0]?.id ?? "");

	const selectedResponse = responses.find(response => response.id === effectiveSelectedResponseId);
	const selectedResponseArrayIndex = responses.findIndex(response => response.id === effectiveSelectedResponseId);
	const selectedResponseIndex = selectedResponse ? responses.findIndex(response => response.id === selectedResponse.id) + 1 : 0;
	const selectedResponseDetails = effectiveSelectedResponseId ? responseDetailsMap.get(effectiveSelectedResponseId) : undefined;
	const hasPreviousResponse = selectedResponseArrayIndex > 0;
	const hasNextResponse = selectedResponseArrayIndex >= 0 && selectedResponseArrayIndex < responses.length - 1;

	const selectedAnswersByQuestionId = useMemo(() => {
		const next = new Map<string, ResponsesAnswersDetail>();
		for (const section of selectedResponseDetails?.sections ?? []) {
			for (const answerDetail of section.answerDetails ?? []) {
				next.set(answerDetail.question.id, answerDetail);
			}
		}
		return next;
	}, [selectedResponseDetails]);

	const questionsById = useMemo(() => new Map(allQuestions.map(question => [question.id, question])), [allQuestions]);

	const selectedRendererValues = useMemo(() => {
		const valueByQuestionId = new Map<string, string>();
		const otherTextByQuestionId = new Map<string, string>();

		for (const [questionId, answerDetail] of selectedAnswersByQuestionId.entries()) {
			const rawAnswer = answerDetail.payload?.answer as { value?: unknown; otherText?: string } | undefined;

			if (!rawAnswer) {
				valueByQuestionId.set(questionId, "");
				continue;
			}

			if (Array.isArray(rawAnswer.value)) {
				valueByQuestionId.set(questionId, rawAnswer.value.map(value => String(value)).join(","));
				if (rawAnswer.otherText?.trim()) {
					otherTextByQuestionId.set(questionId, rawAnswer.otherText.trim());
				}
				continue;
			}

			if (typeof rawAnswer.value === "number" || typeof rawAnswer.value === "string") {
				valueByQuestionId.set(questionId, String(rawAnswer.value));
				continue;
			}

			if (rawAnswer.value && typeof rawAnswer.value === "object") {
				const oauthValue = rawAnswer.value as { username?: string; email?: string };
				valueByQuestionId.set(questionId, oauthValue.username || oauthValue.email || answerDetail.payload?.displayValue || "");
				continue;
			}

			valueByQuestionId.set(questionId, answerDetail.payload?.displayValue || "");
		}

		return { valueByQuestionId, otherTextByQuestionId };
	}, [selectedAnswersByQuestionId]);

	const memberDisplayById = useMemo(() => {
		const next = new Map<string, string>();
		for (const member of membersQuery.data ?? []) {
			next.set(member.id, member.name || member.username || member.emails?.[0] || member.id);
		}
		return next;
	}, [membersQuery.data]);

	const isCheckingSheet = verifyMutation.isPending || updateFormMutation.isPending;
	const serviceAccountEmail = emailQuery.data?.email ?? "tickets@sitcon-324316.iam.gserviceaccount.com";

	const handleCopyServiceAccount = async () => {
		try {
			await navigator.clipboard.writeText(serviceAccountEmail);
			pushToast({ title: "已複製服務帳號", variant: "success" });
		} catch {
			pushToast({ title: "複製失敗", variant: "error" });
		}
	};

	const handleVerifySheet = () => {
		if (!sheetUrl.trim()) {
			pushToast({ title: "請先貼上 Google Sheets URL", variant: "warning" });
			return;
		}

		verifyMutation.mutate(
			{ googleSheetUrl: sheetUrl.trim() },
			{
				onSuccess: verifyResult => {
					if (!verifyResult.isValid) {
						setIsSheetLinked(false);
						pushToast({
							title: "尚未完成連結",
							description: "請確認服務帳號已被授予 Google Sheets 編輯權限。",
							variant: "error"
						});
						return;
					}

					updateFormMutation.mutate(
						{ googleSheetUrl: sheetUrl.trim() },
						{
							onSuccess: () => {
								setIsSheetLinked(true);
								pushToast({ title: "已連結至試算表", variant: "success" });
							},
							onError: error => {
								pushToast({ title: "儲存失敗", description: (error as Error).message, variant: "error" });
							}
						}
					);
				},
				onError: error => {
					setIsSheetLinked(false);
					pushToast({ title: "檢查失敗", description: (error as Error).message, variant: "error" });
				}
			}
		);
	};

	const handleViewForm = () => {
		window.open(`/forms/${formData.id}`, "_blank", "noopener,noreferrer");
	};

	const handleSelectPreviousResponse = () => {
		if (!hasPreviousResponse) return;
		setSelectedResponseId(responses[selectedResponseArrayIndex - 1].id);
	};

	const handleSelectNextResponse = () => {
		if (!hasNextResponse) return;
		setSelectedResponseId(responses[selectedResponseArrayIndex + 1].id);
	};

	const responseCountText = `${responses.length} 則回應`;
	const chartBarColor = useMemo(() => getCssVarColor("--orange", "#ffb86c"), []);
	const chartPieColors = useMemo(
		() => [
			getCssVarColor("--orange", "#ffb86c"),
			getCssVarColor("--cyan", "#8be9fd"),
			getCssVarColor("--purple", "#bd93f9"),
			getCssVarColor("--green", "#50fa7b"),
			getCssVarColor("--pink", "#ff79c6"),
			getCssVarColor("--yellow", "#f1fa8c"),
			getCssVarColor("--red", "#ff5555")
		],
		[]
	);
	const chartTextColor = useMemo(() => getCssVarColor("--foreground", "#f8f8f2"), []);
	const selectedResponderDisplay = selectedResponse ? (memberDisplayById.get(selectedResponse.submittedBy) ?? selectedResponse.submittedBy) : "";

	if (responsesQuery.isLoading || sectionsQuery.isLoading) {
		return <LoadingSpinner />;
	}

	if (responsesQuery.isError) {
		return <ErrorMessage message={(responsesQuery.error as Error)?.message ?? "無法載入回覆列表"} />;
	}

	if (sectionsQuery.isError) {
		return <ErrorMessage message={(sectionsQuery.error as Error)?.message ?? "無法載入題目資料"} />;
	}

	return (
		<>
			<div className={styles.container}>
				<div className={styles.topHeader}>
					<h2 className={styles.totalText}>{responseCountText}</h2>
					<Button className={styles.sheetButton} variant="secondary" onClick={() => setIsSheetPopupOpen(true)}>
						<SquareArrowOutUpRight size={16} />
						連結試算表
					</Button>
				</div>

				<div className={styles.modeTabs}>
					<button className={`${styles.modeTab} ${mode === "summary" ? styles.modeTabActive : ""}`} onClick={() => setMode("summary")}>
						摘要
					</button>
					<button className={`${styles.modeTab} ${mode === "individual" ? styles.modeTabActive : ""}`} onClick={() => setMode("individual")}>
						個別
					</button>
				</div>

				{mode === "summary" && (
					<div className={styles.contentStack}>
						{detailsError && <ErrorMessage message={detailsError.message ?? "無法載入回覆詳情"} />}
						{detailsLoading && <LoadingSpinner />}
						{responses.length === 0 && <p className={styles.emptyState}>尚無回覆。</p>}
						{responses.length > 0 &&
							allQuestions.map(question => {
								const details = answerDetailsByQuestionId.get(question.id) ?? [];
								const hasDescription = Boolean(question.description?.trim());
								return (
									<section key={question.id} className={styles.questionBlock}>
										<div className={styles.questionMeta}>
											<p className={styles.questionTitle}>{question.title}</p>
											{hasDescription && <Markdown className={styles.questionDescription} content={question.description ?? ""} />}
											<p className={styles.questionCount}>{responseCountText}</p>
										</div>
										<div className={styles.questionContent}>{renderSummaryVisualization(question, details, chartBarColor, chartPieColors, chartTextColor)}</div>
									</section>
								);
							})}
					</div>
				)}

				{mode === "individual" && (
					<div className={styles.contentStack}>
						<div className={styles.selectorBlock}>
							<span className={styles.selectorLabel}>選擇回覆</span>
							<div className={styles.selectorControls}>
								<button className={styles.selectorArrowButton} onClick={handleSelectPreviousResponse} disabled={!hasPreviousResponse} aria-label="上一則回覆" type="button">
									<ChevronLeft size={16} />
								</button>
								<Select
									value={effectiveSelectedResponseId}
									onValueChange={setSelectedResponseId}
									variant="text"
									options={responses.map((response, index) => ({
										value: response.id,
										label: `回覆 ${index + 1}`
									}))}
									placeholder="請選擇回覆"
								/>
								<button className={styles.selectorArrowButton} onClick={handleSelectNextResponse} disabled={!hasNextResponse} aria-label="下一則回覆" type="button">
									<ChevronRight size={16} />
								</button>
							</div>
						</div>

						{detailsError && <ErrorMessage message={detailsError.message ?? "無法載入回覆詳情"} />}
						{detailsLoading && <LoadingSpinner />}
						{!selectedResponse && responses.length === 0 && <p className={styles.emptyState}>尚無回覆。</p>}

						{selectedResponse && (
							<section className={styles.questionBlock}>
								<div className={styles.responseHeader}>
									<p className={styles.responseTitle}>回覆 {selectedResponseIndex}</p>
									<p className={styles.responseMeta}>提交時間：{new Date(selectedResponse.createdAt).toLocaleString("zh-TW")}</p>
									<p className={styles.responseMeta}>填答者：{selectedResponderDisplay}</p>
								</div>
							</section>
						)}

						{selectedResponse &&
							allQuestions.map(question => {
								const hasDescription = Boolean(question.description?.trim());
								const value = selectedRendererValues.valueByQuestionId.get(question.id) ?? "";
								const otherTextValue = selectedRendererValues.otherTextByQuestionId.get(question.id) ?? "";
								const sourceQuestion = question.sourceId ? questionsById.get(question.sourceId) : undefined;
								const sourceAnswerValue = question.sourceId ? (selectedRendererValues.valueByQuestionId.get(question.sourceId) ?? "") : "";

								return (
									<section key={question.id} className={styles.questionBlock}>
										<div className={styles.questionMeta}>
											<p className={styles.questionTitle}>{question.title}</p>
											{hasDescription && <Markdown className={styles.questionDescription} content={question.description ?? ""} />}
										</div>
										<div className={styles.readonlyQuestionContent}>
											<FormQuestionRenderer
												question={question}
												value={value}
												otherTextValue={otherTextValue}
												sourceQuestion={sourceQuestion}
												sourceAnswerValue={sourceAnswerValue}
												disableFileUpload
												onAnswerChange={() => {}}
												onOtherTextChange={() => {}}
											/>
										</div>
									</section>
								);
							})}
					</div>
				)}
			</div>

			<Dialog open={isSheetPopupOpen} onOpenChange={setIsSheetPopupOpen} title="回覆搜集">
				<StatusTag
					variant={isSheetLinked ? "published" : "draft"}
					label={isSheetLinked ? "已連結至試算表" : "尚未連結至試算表"}
					showDot={isSheetLinked}
					className={isSheetLinked ? styles.statusLinked : styles.statusUnlinked}
				/>

				<p className={styles.popupHint}>請將以下服務帳號加入您的 Google Sheets 編輯權限：</p>

				<div className={styles.serviceAccountBox}>
					{emailQuery.isLoading ? <LoadingSpinner /> : <span>{serviceAccountEmail}</span>}
					<Button className={styles.copyButton} variant="secondary" onClick={handleCopyServiceAccount} title="複製服務帳號">
						<Copy size={16} />
					</Button>
				</div>

				<input className={styles.sheetUrlInput} value={sheetUrl} onChange={event => setSheetUrl(event.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />

				<div className={styles.popupActions}>
					<Button className={styles.checkStatusButton} variant="secondary" onClick={handleVerifySheet} disabled={isCheckingSheet}>
						<Repeat2 size={16} />
						{isCheckingSheet ? "檢查中..." : "檢查狀態"}
					</Button>
					<Button onClick={handleViewForm}>
						<SquareArrowOutUpRight size={16} />
						檢視表單
					</Button>
				</div>
			</Dialog>
		</>
	);
};
